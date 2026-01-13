/*package com.projetocefoods.cefoods.service;

import com.projetocefoods.cefoods.dto.PedidoDTO.*;
import com.projetocefoods.cefoods.model.Loja;
import com.projetocefoods.cefoods.model.Pedido;
import com.projetocefoods.cefoods.repository.LojaRepository;
import com.projetocefoods.cefoods.repository.PedidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepo;
    private final LojaRepository lojaRepo;

    public Pedido criar(PedidoCreate dto) {
        Loja loja = lojaRepo.findById(dto.idLoja())
                .orElseThrow(() -> new IllegalArgumentException("Loja não encontrada"));

        Pedido pedido = Pedido.builder()
                .idUsuario(dto.idUsuario())
                .loja(loja)
                .formaPagamento(Enum.valueOf(com.projetocefoods.cefoods.model.FormaPagamento.class, dto.formaPagamento()))
                .status(com.projetocefoods.cefoods.model.StatusPedido.pendente)
                .dataPedido(LocalDateTime.now())
                .valorTotal(0.0)
                .observacao(dto.observacao())
                .build();

        return pedidoRepo.save(pedido);
    }

    public Optional<Pedido> buscarPorId(Long id) {
        return pedidoRepo.findById(id);
    }

    public List<Pedido> listarTodos() {
        return pedidoRepo.findAll();
    }

    public Pedido atualizarStatus(Long id, com.projetocefoods.cefoods.model.StatusPedido novoStatus) {
        Pedido pedido = pedidoRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Pedido não encontrado"));

        pedido.setStatus(novoStatus);
        return pedidoRepo.save(pedido);
    }

    public void deletar(Long id) {
        if (!pedidoRepo.existsById(id)) {
            throw new IllegalArgumentException("Pedido não encontrado");
        }
        pedidoRepo.deleteById(id);
    }
}*/

package com.projetocefoods.cefoods.service;

import com.projetocefoods.cefoods.dto.ItemPedidoDTO.ItemPedidoResponse;
import com.projetocefoods.cefoods.dto.PedidoDTO.PedidoResponse;
import com.projetocefoods.cefoods.model.*;
import com.projetocefoods.cefoods.repository.PedidoItemRepository;
import com.projetocefoods.cefoods.repository.PedidoRepository;
import com.projetocefoods.cefoods.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
/*
@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepo;
    private final PedidoItemRepository pedidoItemRepo;
    private final ProdutoRepository produtoRepo;
    private final NotificacaoService notificacaoService;
    private final EmailService emailService;
    private final EmailService emailService;
    private final EmailService emailService;
    

    @Transactional
    public Pedido criarPedido(Usuario usuario, Loja loja, String nomeCliente,
            String formaPagamento, Double total, String horarioRetirada,
            List<PedidoItem> itensPreCriados) {

        Pedido pedido = Pedido.builder()
                .usuario(usuario)
                .loja(loja)
                .nomeCliente(nomeCliente)
                .formaPagamento(formaPagamento)
                .total(total)
                .status("PENDING")
                .dataPedido(LocalDateTime.now())
                .horarioRetirada(horarioRetirada)
                .build();

        pedido = pedidoRepo.save(pedido);

        // NOTIFICACAO
        // dentro de PedidoService.criarPedido, depois do pedido salvo:
        // Depois de salvar o pedido
        Usuario donoLoja = pedido.getLoja().getUsuario();
        Usuario comprador = pedido.getUsuario();

        // notificação para o VENDEDOR
        notificacaoService.criarNotificacaoParaUsuario(
                "ORDER_RECEIVED",
                "Pedido recebido",
                "Você recebeu um pedido de " + comprador.getNome(),
                donoLoja,
                pedido.getLoja(),
                pedido.getIdPedido(),
                null,
                null);

        // notificação para o COMPRADOR
        notificacaoService.criarNotificacaoParaUsuario(
                "ORDER_PENDING",
                "Pedido em análise",
                "Seu pedido " + pedido.getIdPedido()
                        + " foi enviado com sucesso. Aguarde o vendedor aceitar ou recusar.",
                comprador,
                pedido.getLoja(),
                pedido.getIdPedido(),
                null,
                null);

        // -----------------------------------

        // ajusta estoque e salva itens
        for (PedidoItem item : itensPreCriados) {
            Produto p = produtoRepo.findById(item.getProduto().getIdProduto())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Produto não encontrado: " + item.getProduto().getIdProduto()));

            if (p.getEstoque() < item.getQuantidade()) {
                throw new IllegalArgumentException("Estoque insuficiente para " + p.getNome());
            }
            p.setEstoque(p.getEstoque() - item.getQuantidade());
            produtoRepo.save(p);

            PedidoItem pi = PedidoItem.builder()
                    .pedido(pedido)
                    .produto(p)
                    .nome(p.getNome())
                    .preco(item.getPreco())
                    .quantidade(item.getQuantidade())
                    .build();

            pedidoItemRepo.save(pi);
        }

        return pedido;
    }
}
 */
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepo;
    private final PedidoItemRepository pedidoItemRepo;
    private final ProdutoRepository produtoRepo;
    private final NotificacaoService notificacaoService;
    private final EmailService emailService;
    // método usado pelo controller que recebe DTO cru
    @Transactional
    public PedidoResponse criarPedidoFromController(Pedido pedido) {
        Pedido novo = criarPedido(
                pedido.getUsuario(),
                pedido.getLoja(),
                pedido.getNomeCliente(),
                pedido.getFormaPagamento(),
                pedido.getTotal(),
                pedido.getHorarioRetirada(),
                pedido.getItens());
        return toDTO(novo);
    }

    @Transactional
    public Pedido criarPedido(Usuario usuario, Loja loja, String nomeCliente,
            String formaPagamento, Double total, String horarioRetirada,
            List<PedidoItem> itensPreCriados) {

        Pedido pedido = Pedido.builder()
                .usuario(usuario)
                .loja(loja)
                .nomeCliente(nomeCliente)
                .formaPagamento(formaPagamento)
                .total(total)
                .status("PENDING")
                .dataPedido(LocalDateTime.now())
                .horarioRetirada(horarioRetirada)
                .build();

        pedido = pedidoRepo.save(pedido);

        // 🔔 notificações
        Usuario donoLoja = pedido.getLoja().getUsuario();
        Usuario comprador = pedido.getUsuario();

        notificacaoService.criarNotificacaoParaUsuario(
                "ORDER_RECEIVED",
                "Pedido recebido",
                "Você recebeu um pedido de " + comprador.getNome(),
                donoLoja,
                pedido.getLoja(),
                pedido.getIdPedido(),
                null,
                null);

        notificacaoService.criarNotificacaoParaUsuario(
                "ORDER_PENDING",
                "Pedido em análise",
                "Seu pedido " + pedido.getIdPedido() + " foi enviado com sucesso.",
                comprador,
                pedido.getLoja(),
                pedido.getIdPedido(),
                null,
                null);

        // Ajuste estoque e salva itens
        for (PedidoItem item : itensPreCriados) {
            Produto p = produtoRepo.findById(item.getProduto().getIdProduto())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Produto não encontrado: " + item.getProduto().getIdProduto()));

            if (p.getEstoque() < item.getQuantidade()) {
                throw new IllegalArgumentException("Estoque insuficiente para " + p.getNome());
            }
            p.setEstoque(p.getEstoque() - item.getQuantidade());
            produtoRepo.save(p);

            PedidoItem pi = PedidoItem.builder()
                    .pedido(pedido)
                    .produto(p)
                    .nome(p.getNome())
                    .preco(item.getPreco())
                    .quantidade(item.getQuantidade())
                    .build();

            pedidoItemRepo.save(pi);

            // notificação de estoque baixo
            if (p.getEstoque() <= p.getEstoqueMinimo()) {
                notificacaoService.criarNotificacaoParaUsuario(
                        "LOW_STOCK",
                        "Estoque baixo",
                        "Alerta! " + p.getNome() + " está com estoque baixo.",
                        p.getLoja().getUsuario(),
                        p.getLoja(),
                        null,
                        p.getIdProduto(),
                        null);
            }
        }

        return pedido;
    }

    // imports omitidos (mantenha os existentes)
    @Transactional
    public Optional<PedidoResponse> atualizarStatus(Long id, String status) {
        return pedidoRepo.findById(id).map(p -> {
            // normaliza para maiúsculas e trata nulos
            String s = status != null ? status.trim().toUpperCase() : null;
            p.setStatus(s);
            Pedido salvo = pedidoRepo.save(p);

            Usuario comprador = salvo.getUsuario();

            // ACEITO / ACCEPTED
            if ("ACEITO".equals(s) || "ACCEPTED".equals(s)) {
                notificacaoService.criarNotificacaoParaUsuario(
                        "ORDER_ACCEPTED",
                        "Pedido aceito",
                        "Seu pedido " + salvo.getIdPedido() + " foi aceito. Encontre-se com o vendedor para retirá-lo.",
                        comprador,
                        salvo.getLoja(),
                        salvo.getIdPedido(),
                        null,
                        null);
            }

            // RECUSADO / CANCELLED / DECLINED -> devolver estoque
            else if ("RECUSADO".equals(s) || "CANCELLED".equals(s) || "DECLINED".equals(s)) {
                notificacaoService.criarNotificacaoParaUsuario(
                        "ORDER_DECLINED",
                        "Pedido recusado",
                        "Seu pedido " + salvo.getIdPedido() + " foi recusado.",
                        comprador,
                        salvo.getLoja(),
                        salvo.getIdPedido(),
                        null,
                        null);

                // -> devolve o estoque com segurança
                List<PedidoItem> itens = pedidoItemRepo.findByPedido(salvo); // veja repositório abaixo
                if (itens == null) {
                    itens = salvo.getItens();
                }
                if (itens != null) {
                    for (PedidoItem item : itens) {
                        // Proteja contra possíveis nulls
                        if (item == null || item.getProduto() == null || item.getQuantidade() == null)
                            continue;
                        Produto produto = produtoRepo.findById(item.getProduto().getIdProduto()).orElse(null);
                        if (produto == null)
                            continue;

                        Integer atual = produto.getEstoque() == null ? 0 : produto.getEstoque();
                        Integer devolve = item.getQuantidade() == null ? 0 : item.getQuantidade();
                        produto.setEstoque(atual + devolve);
                        produtoRepo.save(produto);
                    }
                }
            }

            // CONCLUIDO / COMPLETED
            else if ("CONCLUIDO".equals(s) || "COMPLETED".equals(s)) {
                notificacaoService.criarNotificacaoParaUsuario(
                        "ORDER_COMPLETED",
                        "Pedido concluído",
                        "Seu pedido " + salvo.getIdPedido() + " foi concluído com sucesso.",
                        comprador,
                        salvo.getLoja(),
                        salvo.getIdPedido(),
                        null,
                        null);

                emailService.enviarPedidoConcluido(comprador, salvo);
            }

            // Outros status -> apenas salva e retorna
            return toDTO(salvo);
        });
    }

    // exemplo simples de toDTO
    private PedidoResponse toDTO(Pedido pedido) {
        List<ItemPedidoResponse> itens = pedido.getItens() != null
                ? pedido.getItens().stream()
                        .map(i -> new ItemPedidoResponse(
                                pedido.getIdPedido(),
                                i.getProduto().getIdProduto(),
                                i.getProduto().getNome(), // 🔹 envia o nome
                                i.getQuantidade(),
                                i.getPreco(),
                                i.getPreco() * i.getQuantidade()))

                        .collect(Collectors.toList())
                : List.of();

        String chavePixLoja = null;
        if ("PIX".equalsIgnoreCase(pedido.getFormaPagamento())
            && "ACCEPTED".equalsIgnoreCase(pedido.getStatus())) {
            Loja loja = pedido.getLoja();
            Usuario dono = loja != null ? loja.getUsuario() : null;
            String chave = dono != null ? dono.getChavePix() : null;
            if (chave != null && !chave.isBlank()) {
            chavePixLoja = chave;
            }
        }

        return new PedidoResponse(
            pedido.getIdPedido(),
            pedido.getUsuario().getIdUsuario(),
            pedido.getLoja().getIdLoja(),
            pedido.getFormaPagamento(),
            pedido.getStatus(),
            pedido.getDataPedido() != null ? pedido.getDataPedido().format(DateTimeFormatter.ISO_DATE_TIME) : null,
            pedido.getHorarioRetirada(),
            pedido.getTotal(),
            pedido.getNomeCliente(), // observação substituído por nomeCliente
            chavePixLoja,
            itens);
    }

    public List<PedidoResponse> listarPorUsuario(Long idUsuario) {
        return pedidoRepo.findByUsuarioIdUsuario(idUsuario).stream().map(this::toDTO).toList();
    }

    public List<PedidoResponse> listarPorLoja(Long idLoja) {
        return pedidoRepo.findByLojaIdLoja(idLoja).stream().map(this::toDTO).toList();
    }
}
