package com.projetocefoods.cefoods.service;

import com.projetocefoods.cefoods.dto.admin.AdminConsoleDTOs.AdminActivityDTO;
import com.projetocefoods.cefoods.dto.admin.AdminConsoleDTOs.AdminComentarioDTO;
import com.projetocefoods.cefoods.dto.admin.AdminConsoleDTOs.AdminLojaDTO;
import com.projetocefoods.cefoods.dto.admin.AdminConsoleDTOs.AdminPanelDTO;
import com.projetocefoods.cefoods.dto.admin.AdminConsoleDTOs.AdminProdutoDTO;
import com.projetocefoods.cefoods.dto.admin.AdminConsoleDTOs.AdminSummaryDTO;
import com.projetocefoods.cefoods.dto.admin.AdminConsoleDTOs.AdminUsuarioDTO;
import com.projetocefoods.cefoods.model.Avaliacao;
import com.projetocefoods.cefoods.model.Comentario;
import com.projetocefoods.cefoods.model.ComentarioStatus;
import com.projetocefoods.cefoods.model.Loja;
import com.projetocefoods.cefoods.model.Pedido;
import com.projetocefoods.cefoods.model.Produto;
import com.projetocefoods.cefoods.model.StatusAdministrativoLoja;
import com.projetocefoods.cefoods.model.Usuario;
import com.projetocefoods.cefoods.repository.AvaliacaoRepository;
import com.projetocefoods.cefoods.repository.ComentarioRepository;
import com.projetocefoods.cefoods.repository.LojaRepository;
import com.projetocefoods.cefoods.repository.PedidoRepository;
import com.projetocefoods.cefoods.repository.ProdutoRepository;
import com.projetocefoods.cefoods.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminPanelService {

    private final UsuarioRepository usuarioRepository;
    private final LojaRepository lojaRepository;
    private final ProdutoRepository produtoRepository;
    private final ComentarioRepository comentarioRepository;
    private final PedidoRepository pedidoRepository;
    private final AvaliacaoRepository avaliacaoRepository;

    @Transactional(readOnly = true)
    public AdminPanelDTO buildPanel() {
        List<Usuario> usuarios = usuarioRepository.findAll();
        List<Loja> lojas = lojaRepository.findAll();
        List<Produto> produtos = produtoRepository.findAll();
        List<Comentario> comentarios = comentarioRepository.findAll();
        List<Pedido> pedidos = pedidoRepository.findAll();
        List<Avaliacao> avaliacoes = avaliacaoRepository.findAll();

        Map<Long, Long> pedidosPorUsuario = pedidos.stream()
                .filter(p -> p.getUsuario() != null && p.getUsuario().getIdUsuario() != null)
                .collect(Collectors.groupingBy(p -> p.getUsuario().getIdUsuario(), Collectors.counting()));

        Map<Long, List<String>> lojasPorUsuario = lojas.stream()
                .filter(loja -> loja.getUsuario() != null && loja.getUsuario().getIdUsuario() != null)
                .collect(Collectors.groupingBy(loja -> loja.getUsuario().getIdUsuario(),
                        Collectors.mapping(loja -> safe(loja.getNomeFantasia()), Collectors.toList())));

        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime startOfWindow = today.minusDays(30).atStartOfDay();

        Map<Long, Long> pedidosHojePorLoja = pedidos.stream()
                .filter(p -> p.getLoja() != null && p.getLoja().getIdLoja() != null)
                .filter(p -> p.getDataPedido() != null && !p.getDataPedido().isBefore(startOfDay))
                .collect(Collectors.groupingBy(p -> p.getLoja().getIdLoja(), Collectors.counting()));

        Map<Long, Double> faturamentoMesPorLoja = pedidos.stream()
                .filter(p -> p.getLoja() != null && p.getLoja().getIdLoja() != null)
                .filter(p -> p.getDataPedido() != null && !p.getDataPedido().isBefore(startOfWindow))
                .collect(Collectors.groupingBy(p -> p.getLoja().getIdLoja(),
                        Collectors.summingDouble(p -> p.getTotal() != null ? p.getTotal() : 0.0)));

        Map<Long, Double> mediaNotaPorProduto = avaliacoes.stream()
                .filter(av -> av.getProduto() != null && av.getProduto().getIdProduto() != null)
                .collect(Collectors.groupingBy(av -> av.getProduto().getIdProduto(),
                        Collectors.averagingInt(Avaliacao::getEstrelas)));

        double satisfacaoMedia = avaliacoes.isEmpty()
                ? 0.0
                : avaliacoes.stream().collect(Collectors.averagingInt(Avaliacao::getEstrelas));

        LocalDateTime now = LocalDateTime.now();
        long usuariosRecentes = usuarios.stream()
                .filter(usuario -> usuario.getUltimoAcesso() != null && usuario.getUltimoAcesso().isAfter(now.minusDays(7)))
                .count();

        List<AdminUsuarioDTO> usuariosDTO = usuarios.stream()
                .map(usuario -> new AdminUsuarioDTO(
                        usuario.getIdUsuario(),
                        safe(usuario.getNome()),
                        safe(usuario.getEmail()),
                        resolvePerfil(usuario.getTipoPerfil()),
                        resolveUsuarioStatus(usuario),
                        resolveData(usuario.getUltimoAcesso(), usuario.getDataCadastro()),
                        pedidosPorUsuario.getOrDefault(usuario.getIdUsuario(), 0L),
                        List.copyOf(lojasPorUsuario.getOrDefault(usuario.getIdUsuario(), List.of()))
                ))
                .toList();

        List<AdminLojaDTO> lojasDTO = lojas.stream()
            .map(loja -> {
                StatusAdministrativoLoja statusAdm = resolveStatusAdm(loja);
                return new AdminLojaDTO(
                    loja.getIdLoja(),
                    safe(loja.getNomeFantasia()),
                    safe(loja.getDescricao()),
                    loja.getUsuario() != null ? safe(loja.getUsuario().getNome()) : "",
                    resolveLojaStatus(loja, statusAdm),
                    statusAdm.name(),
                    pedidosHojePorLoja.getOrDefault(loja.getIdLoja(), 0L),
                    loja.getAvaliacaoMedia() != null ? loja.getAvaliacaoMedia() : 0.0,
                    faturamentoMesPorLoja.getOrDefault(loja.getIdLoja(), 0.0),
                    safe(loja.getLocalizacao()),
                    resolveData(loja.getDataCriacao(), null)
                );
            })
            .toList();

        List<AdminProdutoDTO> produtosDTO = produtos.stream()
            .map(produto -> new AdminProdutoDTO(
                produto.getIdProduto(),
                safe(produto.getNome()),
                produto.getLoja() != null ? safe(produto.getLoja().getNomeFantasia()) : "",
                produto.getCategoria() != null ? safe(produto.getCategoria().getNome()) : "",
                produto.getEstoque() != null ? produto.getEstoque() : 0,
                produto.getPreco() != null ? produto.getPreco() : 0.0,
                resolveProdutoStatus(produto),
                resolveData(produto.getDataCadastro(), null),
                produto.getVezesVendido() != null && produto.getVezesVendido() > 50,
                produto.getLoja() != null ? produto.getLoja().getIdLoja() : null,
                safe(produto.getDescricao()),
                resolveImagem(produto)
            ))
            .toList();

        List<AdminComentarioDTO> comentariosDTO = comentarios.stream()
                .map(comentario -> {
                    Produto produto = comentario.getProduto();
                    Loja loja = produto != null ? produto.getLoja() : null;
                    Long produtoId = produto != null ? produto.getIdProduto() : null;
                    double nota = mediaNotaPorProduto.getOrDefault(produtoId, 5.0d);
                    String status = resolveComentarioStatus(comentario);
                    return new AdminComentarioDTO(
                            comentario.getId(),
                            safe(comentario.getNomeUsuario()),
                            loja != null ? safe(loja.getNomeFantasia()) : "",
                            produto != null ? safe(produto.getNome()) : "",
                            status,
                            nota,
                            safe(comentario.getTexto()),
                            resolveData(comentario.getData(), null),
                            "app",
                            inferirTags(comentario.getTexto())
                    );
                })
                .toList();

        long comentariosPendentes = comentariosDTO.stream()
                .filter(c -> "pendente".equalsIgnoreCase(c.status()))
                .count();

        long lojasPendentes = lojas.stream()
            .filter(loja -> resolveStatusAdm(loja) == StatusAdministrativoLoja.EM_ANALISE)
            .count();

        long produtosSemEstoque = produtos.stream()
                .filter(produto -> produto.getEstoque() != null && produto.getEstoque() <= 0)
                .count();

        AdminSummaryDTO summary = new AdminSummaryDTO(
                usuarios.size(),
                usuariosRecentes,
                lojas.size(),
                lojasPendentes,
                produtos.size(),
                produtosSemEstoque,
                comentariosPendentes,
            Math.round(satisfacaoMedia * 10.0) / 10.0
        );

        long usuariosAtivos = usuarios.stream()
                .filter(usuario -> !"suspenso".equals(resolveUsuarioStatus(usuario)))
                .count();

        List<AdminActivityDTO> atividades = buildActivities(summary, usuariosAtivos);

        return new AdminPanelDTO(summary, usuariosDTO, lojasDTO, produtosDTO, comentariosDTO, atividades);
    }

    private List<AdminActivityDTO> buildActivities(AdminSummaryDTO summary, long usuariosAtivos) {
        long baseId = System.currentTimeMillis();
        LocalDateTime now = LocalDateTime.now();
        return List.of(
                new AdminActivityDTO(baseId, "Usuarios",
                        usuariosAtivos + " perfis ativos no momento.", now.toString(), "success"),
                new AdminActivityDTO(baseId + 1, "Lojas",
                        summary.lojasPendentes() + " lojas aguardam revisao manual.", now.toString(),
                        summary.lojasPendentes() > 0 ? "alert" : "info"),
                new AdminActivityDTO(baseId + 2, "Produtos",
                        summary.produtosSemEstoque() + " produtos precisam de reabastecimento.", now.toString(),
                        summary.produtosSemEstoque() > 0 ? "alert" : "info")
        );
    }

    private String resolveUsuarioStatus(Usuario usuario) {
        if (Boolean.FALSE.equals(usuario.getAtivo())) {
            return "suspenso";
        }
        if (Boolean.FALSE.equals(usuario.getEmailVerificado())) {
            return "pendente";
        }
        return "ativo";
    }

    private StatusAdministrativoLoja resolveStatusAdm(Loja loja) {
        return loja.getStatusAdm() != null ? loja.getStatusAdm() : StatusAdministrativoLoja.ATIVA;
    }

    private String resolveLojaStatus(Loja loja, StatusAdministrativoLoja statusAdm) {
        if (statusAdm != null && !statusAdm.permiteOperacao()) {
            return "suspensa";
        }
        if (Boolean.TRUE.equals(loja.getStatus())) {
            return "operando";
        }
        return "fechada";
    }

    private String resolvePerfil(String rawPerfil) {
        if (rawPerfil == null || rawPerfil.isBlank()) {
            return "cliente";
        }
        String normalized = rawPerfil.trim().toLowerCase();
        return switch (normalized) {
            case "admin" -> "admin";
            case "vendedor" -> "vendedor";
            default -> "cliente";
        };
    }

    private String resolveProdutoStatus(Produto produto) {
        if (produto.getEstoque() != null && produto.getEstoque() == 0) {
            return "indisponivel";
        }
        if (Boolean.FALSE.equals(produto.getDisponivel())) {
            return "indisponivel";
        }
        if (produto.getEstoque() == null || produto.getEstoque() < 5) {
            return "rascunho";
        }
        return "ativo";
    }

    private String resolveComentarioStatus(Comentario comentario) {
        ComentarioStatus status = comentario.getStatus();
        if (status != null) {
            return status.name().toLowerCase();
        }
        if (comentario.getTexto() != null) {
            String texto = comentario.getTexto().toLowerCase();
            if (texto.contains("ofensa") || texto.contains("fraude")) {
                return "oculto";
            }
            if (texto.contains("reclama")) {
                return "pendente";
            }
        }
        if (comentario.getData() != null && comentario.getData().isAfter(LocalDateTime.now().minusDays(2))) {
            return "pendente";
        }
        return "aprovado";
    }

    private List<String> inferirTags(String texto) {
        if (texto == null || texto.isBlank()) {
            return List.of("geral");
        }
        String normalized = texto.toLowerCase();
        List<String> tags = new ArrayList<>();
        if (normalized.contains("entrega") || normalized.contains("logistica")) {
            tags.add("logistica");
        }
        if (normalized.contains("preco") || normalized.contains("valor")) {
            tags.add("precificacao");
        }
        if (normalized.contains("sabor") || normalized.contains("qualidade")) {
            tags.add("produto");
        }
        if (normalized.contains("suporte") || normalized.contains("ajuda")) {
            tags.add("suporte");
        }
        if (tags.isEmpty()) {
            return List.of("geral");
        }
        return List.copyOf(tags);
    }

    private String resolveData(LocalDateTime primary, LocalDateTime fallback) {
        LocalDateTime target = primary != null ? primary : fallback;
        if (target == null) {
            return LocalDateTime.now().toString();
        }
        return target.toString();
    }

    private String resolveImagem(Produto produto) {
        if (produto.getImagem() == null || produto.getImagem().isBlank()) {
            return null;
        }
        return produto.getImagem().trim();
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}
