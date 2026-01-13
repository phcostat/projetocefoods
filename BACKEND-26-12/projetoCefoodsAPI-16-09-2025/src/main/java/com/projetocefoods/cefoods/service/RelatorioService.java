package com.projetocefoods.cefoods.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.projetocefoods.cefoods.dto.RelatorioDTO;
import com.projetocefoods.cefoods.model.*;
import com.projetocefoods.cefoods.repository.LojaRepository;
import com.projetocefoods.cefoods.repository.PedidoRepository;
import com.projetocefoods.cefoods.repository.RelatorioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class RelatorioService {

    private static final Set<String> STATUS_CONCLUIDO = Set.of("COMPLETED", "CONCLUDED", "FINALIZED", "FINALIZADO", "CONCLUIDO");
    private static final Set<String> STATUS_ACEITO = Set.of("ACCEPTED", "ACEITO", "COMPLETED", "CONCLUDED", "FINALIZED", "FINALIZADO", "CONCLUIDO");
    private static final Set<String> STATUS_RECUSADO = Set.of("RECUSADO", "CANCELLED", "DECLINED");
    private static final Locale LOCALE_PT_BR = new Locale("pt", "BR");
    private static final DateTimeFormatter DIA_LABEL = DateTimeFormatter.ofPattern("EEE dd/MM", LOCALE_PT_BR);

    private final RelatorioRepository relatorioRepository;
    private final PedidoRepository pedidoRepository;
    private final LojaRepository lojaRepository;
    private final RelatorioPdfGenerator pdfGenerator;
    private final FileStorageService fileStorageService;
    private final ObjectMapper objectMapper;

    @Transactional
    public RelatorioDTO.RelatorioResponse gerar(RelatorioDTO.CreateRequest request) {
        if (request == null || request.idLoja() == null) {
            throw new IllegalArgumentException("Loja é obrigatória para geração de relatórios");
        }

        PeriodoRelatorio periodo = request.tipoPeriodo() != null ? request.tipoPeriodo() : PeriodoRelatorio.SEMANAL;
        Loja loja = lojaRepository.findById(request.idLoja())
                .orElseThrow(() -> new IllegalArgumentException("Loja não encontrada"));

        LocalDate[] intervalo = resolverIntervalo(periodo, request.dataInicio(), request.dataFim());
        List<Pedido> pedidosPeriodo = pedidoRepository.findByLojaIdLojaAndDataPedidoBetween(
                loja.getIdLoja(),
                intervalo[0].atStartOfDay(),
                intervalo[1].plusDays(1).atStartOfDay());

        RelatorioDTO.FinanceiroSnapshot calculado = montarSnapshot(pedidosPeriodo, intervalo[0], intervalo[1]);

        Usuario dono = loja.getUsuario();
        String descricaoLoja = textoOuPadrao(loja.getDescricao(), "Loja oficial integrada ao ecossistema Cefoods.");
        String enderecoLoja = textoOuPadrao(loja.getLocalizacao(), "Endereço não informado");
        String donoNome = dono != null ? textoOuPadrao(dono.getNome(), "Responsável não informado") : "Responsável não informado";
        String donoDocumento = dono != null ? textoOuPadrao(dono.getCpf(), "Documento não informado") : "Documento não informado";
        String contatoPrimario = Stream.of(
                dono != null ? dono.getTelefone() : null,
                dono != null ? dono.getEmail() : null)
            .filter(this::hasText)
            .collect(Collectors.joining(" • "));
        String contatoFormatado = hasText(contatoPrimario) ? contatoPrimario : "Central Cefoods: suporte@cefoods.app";
        String lojaContato = String.format("%s • %s", formatarCodigoLoja(loja.getIdLoja()), contatoFormatado);

        RelatorioPdfGenerator.RelatorioPdfContext contexto = new RelatorioPdfGenerator.RelatorioPdfContext(
            textoOuPadrao(loja.getNomeFantasia(), "Loja Cefoods"),
            descricaoLoja,
            enderecoLoja,
            lojaContato,
            donoNome,
            donoDocumento,
            contatoFormatado,
            periodo,
            intervalo[0],
            intervalo[1],
            calculado);
        byte[] pdf = pdfGenerator.gerar(contexto);
        FileStorageService.StoredFileInfo arquivo = fileStorageService.storeBytes(pdf, "relatorios", ".pdf");

        Relatorio relatorio = Relatorio.builder()
                .loja(loja)
                .tipoPeriodo(periodo)
                .dataInicio(intervalo[0])
                .dataFim(intervalo[1])
                .receitaTotal(calculado.receitaTotal())
                .ticketMedio(calculado.ticketMedio())
                .pedidosRecebidos(calculado.pedidosRecebidos())
                .pedidosAceitos(calculado.pedidosAceitos())
                .pedidosRecusados(calculado.pedidosRecusados())
                .itensVendidos(calculado.itensVendidos())
                .taxaConversao(calculado.taxaConversao())
                .arquivoUrl(arquivo.publicUrl())
                .arquivoPath(arquivo.absolutePath())
                .status("GERADO")
                .resumoJson(serializeResumo(request.resumoFinanceiro(), calculado))
                .criadoEm(LocalDateTime.now())
                .build();

        Relatorio salvo = relatorioRepository.save(relatorio);
        return toResponse(salvo);
    }

    @Transactional(readOnly = true)
    public List<RelatorioDTO.RelatorioResponse> listarPorLoja(Long idLoja) {
        if (idLoja == null) {
            return Collections.emptyList();
        }
        return relatorioRepository.findByLojaIdLojaOrderByCriadoEmDesc(idLoja).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RelatorioArquivo baixarArquivo(Long idRelatorio) {
        Relatorio relatorio = relatorioRepository.findById(idRelatorio)
                .orElseThrow(() -> new IllegalArgumentException("Relatório não encontrado"));
        if (relatorio.getArquivoPath() == null) {
            throw new IllegalStateException("Relatório sem arquivo físico armazenado");
        }

        Path caminho = Path.of(relatorio.getArquivoPath());
        if (!Files.exists(caminho)) {
            throw new IllegalStateException("Arquivo do relatório não foi localizado");
        }

        try {
            byte[] conteudo = Files.readAllBytes(caminho);
            ByteArrayResource resource = new ByteArrayResource(conteudo);
            String nomeArquivo = construirNomeArquivo(relatorio);
            return new RelatorioArquivo(resource, nomeArquivo);
        } catch (IOException ex) {
            throw new IllegalStateException("Erro ao ler arquivo do relatório", ex);
        }
    }

    private LocalDate[] resolverIntervalo(PeriodoRelatorio periodo, LocalDate inicio, LocalDate fim) {
        LocalDate dataFim = fim != null ? fim : LocalDate.now();
        LocalDate dataInicio;
        if (inicio != null) {
            dataInicio = inicio;
        } else {
            dataInicio = periodo == PeriodoRelatorio.MENSAL ? dataFim.minusDays(29) : dataFim.minusDays(6);
        }
        if (dataInicio.isAfter(dataFim)) {
            LocalDate temp = dataInicio;
            dataInicio = dataFim;
            dataFim = temp;
        }
        return new LocalDate[]{dataInicio, dataFim};
    }

    private RelatorioDTO.FinanceiroSnapshot montarSnapshot(List<Pedido> pedidos, LocalDate inicio, LocalDate fim) {
        int pedidosRecebidos = pedidos.size();
        int pedidosAceitos = (int) pedidos.stream().filter(this::isAceito).count();
        int pedidosRecusados = (int) pedidos.stream().filter(this::isRecusado).count();

        List<Pedido> pedidosConcluidos = pedidos.stream()
                .filter(this::isConcluido)
                .collect(Collectors.toList());

        double receitaTotal = pedidosConcluidos.stream()
                .mapToDouble(p -> Optional.ofNullable(p.getTotal()).orElse(0.0))
                .sum();

        int itensVendidos = pedidosConcluidos.stream()
                .mapToInt(p -> p.getItens() == null ? 0 : p.getItens().stream()
                        .mapToInt(item -> Optional.ofNullable(item.getQuantidade()).orElse(0))
                        .sum())
                .sum();

        double ticketMedio = pedidosConcluidos.isEmpty() ? 0 : receitaTotal / pedidosConcluidos.size();
        double taxaConversao = pedidosRecebidos == 0 ? 0 : ((double) pedidosConcluidos.size() / pedidosRecebidos) * 100;

        List<RelatorioDTO.TopProduto> topProdutos = calcularTopProdutos(pedidosConcluidos);
        List<RelatorioDTO.ReceitaDiaria> receitaDiaria = calcularReceitaDiaria(pedidosConcluidos);

        RelatorioDTO.PeriodoReferencia periodo = new RelatorioDTO.PeriodoReferencia(inicio.toString(), fim.toString());

        return new RelatorioDTO.FinanceiroSnapshot(
                arredondar(receitaTotal),
                arredondar(ticketMedio),
                pedidosRecebidos,
                pedidosAceitos,
                pedidosRecusados,
                itensVendidos,
                arredondar(taxaConversao),
                topProdutos,
                receitaDiaria,
                LocalDateTime.now().toString(),
                periodo
        );
    }

    private List<RelatorioDTO.TopProduto> calcularTopProdutos(List<Pedido> pedidos) {
        Map<String, ProdutoResumo> mapa = new HashMap<>();
        for (Pedido pedido : pedidos) {
            if (pedido.getItens() == null) {
                continue;
            }
            pedido.getItens().forEach(item -> {
                String nome = item.getNome();
                if (nome == null && item.getProduto() != null) {
                    nome = item.getProduto().getNome();
                }
                if (nome == null) {
                    nome = "Produto";
                }
                ProdutoResumo resumo = mapa.computeIfAbsent(nome, n -> new ProdutoResumo());
                double subtotal = Optional.ofNullable(item.getPreco()).orElse(0.0) * Optional.ofNullable(item.getQuantidade()).orElse(0);
                resumo.total += subtotal;
                resumo.quantidade += Optional.ofNullable(item.getQuantidade()).orElse(0);
            });
        }

        return mapa.entrySet().stream()
                .sorted((a, b) -> Double.compare(b.getValue().total, a.getValue().total))
                .map(entry -> new RelatorioDTO.TopProduto(entry.getKey(), arredondar(entry.getValue().total), entry.getValue().quantidade))
                .collect(Collectors.toList());
    }

    private List<RelatorioDTO.ReceitaDiaria> calcularReceitaDiaria(List<Pedido> pedidos) {
        Map<LocalDate, Double> mapa = new HashMap<>();
        for (Pedido pedido : pedidos) {
            LocalDate dia = Optional.ofNullable(pedido.getDataPedido())
                    .map(LocalDateTime::toLocalDate)
                    .orElse(LocalDate.now());
            double totalAtual = mapa.getOrDefault(dia, 0.0);
            double valorPedido = Optional.ofNullable(pedido.getTotal()).orElse(0.0);
            mapa.put(dia, totalAtual + valorPedido);
        }

        return mapa.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> new RelatorioDTO.ReceitaDiaria(
                        entry.getKey().toString(),
                        DIA_LABEL.format(entry.getKey()),
                        arredondar(entry.getValue())))
                .collect(Collectors.toList());
    }

    private boolean isConcluido(Pedido pedido) {
        return STATUS_CONCLUIDO.contains(normalizarStatus(pedido.getStatus()));
    }

    private boolean isAceito(Pedido pedido) {
        return STATUS_ACEITO.contains(normalizarStatus(pedido.getStatus()));
    }

    private boolean isRecusado(Pedido pedido) {
        return STATUS_RECUSADO.contains(normalizarStatus(pedido.getStatus()));
    }

    private String normalizarStatus(String status) {
        return status == null ? "" : status.trim().toUpperCase(Locale.ROOT);
    }

    private Double arredondar(Double valor) {
        if (valor == null) {
            return 0.0;
        }
        return Math.round(valor * 100.0) / 100.0;
    }

    private String serializeResumo(RelatorioDTO.FinanceiroSnapshot origemApp, RelatorioDTO.FinanceiroSnapshot calculado) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("calculado", calculado);
        if (origemApp != null) {
            payload.put("origemFinanceiroPage", origemApp);
        }
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Erro ao serializar resumo do relatório", e);
        }
    }

    private String construirNomeArquivo(Relatorio relatorio) {
        return String.format("relatorio-%s-%s-%s.pdf",
                relatorio.getTipoPeriodo().name().toLowerCase(Locale.ROOT),
                relatorio.getDataInicio(),
                relatorio.getDataFim());
    }

    private String textoOuPadrao(String texto, String fallback) {
        return hasText(texto) ? texto.trim() : fallback;
    }

    private boolean hasText(String valor) {
        return valor != null && !valor.trim().isEmpty();
    }

    private String formatarCodigoLoja(Long idLoja) {
        return idLoja == null ? "ID #00000" : String.format("ID #%05d", idLoja);
    }

    private RelatorioDTO.RelatorioResponse toResponse(Relatorio relatorio) {
        return new RelatorioDTO.RelatorioResponse(
                relatorio.getIdRelatorio(),
                relatorio.getLoja().getIdLoja(),
                relatorio.getTipoPeriodo(),
                relatorio.getDataInicio(),
                relatorio.getDataFim(),
                relatorio.getReceitaTotal(),
                relatorio.getTicketMedio(),
                relatorio.getPedidosRecebidos(),
                relatorio.getPedidosAceitos(),
                relatorio.getPedidosRecusados(),
                relatorio.getItensVendidos(),
                relatorio.getTaxaConversao(),
                relatorio.getArquivoUrl(),
                relatorio.getStatus(),
                relatorio.getCriadoEm()
        );
    }

    public record RelatorioArquivo(ByteArrayResource resource, String filename) {}

    private static class ProdutoResumo {
        double total = 0.0;
        int quantidade = 0;
    }
}
