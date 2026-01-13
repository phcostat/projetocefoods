package com.projetocefoods.cefoods.service;

import com.projetocefoods.cefoods.dto.AddItemRequest;
import com.projetocefoods.cefoods.dto.CarrinhoDTO;
import com.projetocefoods.cefoods.dto.CheckoutRequest;
import com.projetocefoods.cefoods.dto.CheckoutResponse;
import com.projetocefoods.cefoods.model.*;
import com.projetocefoods.cefoods.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CarrinhoService {

    private final CarrinhoRepository carrinhoRepo;
    private final CarrinhoItemRepository carrinhoItemRepo;
    private final UsuarioRepository usuarioRepo;
    private final ProdutoRepository produtoRepo;
    private final PedidoService pedidoService;

    /* ===================== CONSULTA ===================== */

    public CarrinhoDTO getCarrinhoPorUsuario(Long idUsuario) {
        var usuario = usuarioRepo.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        var cOpt = carrinhoRepo.findByUsuario(usuario);
        if (cOpt.isEmpty()) return emptyDTO();

        var c = cOpt.get();
        var items = carrinhoItemRepo.findByCarrinho(c);

        CarrinhoDTO dto = new CarrinhoDTO();
        dto.idCarrinho = c.getIdCarrinho();
        // idLoja: obtido a partir do primeiro item (se houver)
        dto.idLoja = items.isEmpty() ? null : items.get(0).getProduto().getLoja().getIdLoja();
        dto.itens = items.stream().map(ci -> {
            var it = new CarrinhoDTO.Item();
            it.produtoId = ci.getProduto().getIdProduto();
            it.nome = ci.getProduto().getNome();
            it.precoUnit = ci.getProduto().getPreco();
            it.quantidade = ci.getQuantidade();
            it.foto = ci.getProduto().getImagem();
            return it;
        }).collect(Collectors.toList());
        return dto;
    }

    private CarrinhoDTO emptyDTO() {
        CarrinhoDTO dto = new CarrinhoDTO();
        dto.idCarrinho = null;
        dto.idLoja = null;
        dto.itens = List.of();
        return dto;
    }

    /* ===================== ADD ITEM ===================== */

    @Transactional
    public CarrinhoDTO addItem(Long idUsuario, AddItemRequest req) {
        if (req == null || req.produtoId == null || req.quantidade == null || req.quantidade < 1)
            throw new IllegalArgumentException("Dados inválidos para adicionar item");

        var usuario = usuarioRepo.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        var produto = produtoRepo.findById(req.produtoId)
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado"));

        if (produto.getEstoque() < req.quantidade)
            throw new IllegalArgumentException("Estoque insuficiente");

        // pega (ou cria) o carrinho do usuário — sem amarrar loja
        var carrinho = carrinhoRepo.findByUsuario(usuario)
                .orElseGet(() -> carrinhoRepo.save(
                        Carrinho.builder().usuario(usuario).criadoEm(LocalDateTime.now()).build()
                ));

        // Regra da loja: se já tem item, todos devem ser da mesma loja do primeiro item
        var itensAtuais = carrinhoItemRepo.findByCarrinho(carrinho);
        if (!itensAtuais.isEmpty()) {
            var idLojaCarrinho = itensAtuais.get(0).getProduto().getLoja().getIdLoja();
            var idLojaNovo = produto.getLoja().getIdLoja();
            if (!idLojaCarrinho.equals(idLojaNovo)) {
                throw new IllegalArgumentException("O carrinho já contém itens de outra loja. Esvazie o carrinho para trocar de loja.");
            }
        }

        // Se já existe o produto no carrinho, soma quantidades
        var existenteOpt = carrinhoItemRepo.findByCarrinhoAndProduto(carrinho, produto);
        if (existenteOpt.isPresent()) {
            var existente = existenteOpt.get();
            int novaQtd = existente.getQuantidade() + req.quantidade;
            if (novaQtd > produto.getEstoque())
                throw new IllegalArgumentException("Quantidade total excede o estoque");
            existente.setQuantidade(novaQtd);
            carrinhoItemRepo.save(existente);
        } else {
            var novo = CarrinhoItem.builder()
                    .carrinho(carrinho)
                    .produto(produto)
                    .quantidade(req.quantidade)
                    .build();
            carrinhoItemRepo.save(novo);
        }

        // opcional: atualizar campo carrinho.loja para conveniência (não usado na lógica)
        if (carrinho.getLoja() == null && produto.getLoja() != null) {
            carrinho.setLoja(produto.getLoja());
            carrinhoRepo.save(carrinho);
        }

        return getCarrinhoPorUsuario(idUsuario);
    }

    /* ===================== UPDATE ITEM ===================== */

    @Transactional
    public CarrinhoDTO updateItem(Long idUsuario, Long produtoId, Integer quantidade) {
        var usuario = usuarioRepo.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));
        var produto = produtoRepo.findById(produtoId)
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado"));
        var carrinho = carrinhoRepo.findByUsuario(usuario)
                .orElseThrow(() -> new IllegalArgumentException("Carrinho não encontrado"));
        var item = carrinhoItemRepo.findByCarrinhoAndProduto(carrinho, produto)
                .orElseThrow(() -> new IllegalArgumentException("Item não existe no carrinho"));

        if (quantidade == null || quantidade <= 0) {
            carrinhoItemRepo.delete(item);
        } else {
            if (quantidade > produto.getEstoque())
                throw new IllegalArgumentException("Estoque insuficiente");
            item.setQuantidade(quantidade);
            carrinhoItemRepo.save(item);
        }

        // se esvaziou, libera a loja do carrinho (opcional)
        if (carrinhoItemRepo.findByCarrinho(carrinho).isEmpty()) {
            carrinho.setLoja(null);
            carrinhoRepo.save(carrinho);
        }

        return getCarrinhoPorUsuario(idUsuario);
    }

    /* ===================== REMOVE ITEM ===================== */

    @Transactional
    public CarrinhoDTO removeItem(Long idUsuario, Long produtoId) {
        var usuario = usuarioRepo.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));
        var produto = produtoRepo.findById(produtoId)
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado"));
        var carrinho = carrinhoRepo.findByUsuario(usuario)
                .orElseThrow(() -> new IllegalArgumentException("Carrinho não encontrado"));

        carrinhoItemRepo.findByCarrinhoAndProduto(carrinho, produto)
                .ifPresent(carrinhoItemRepo::delete);

        // se esvaziou, libera a loja do carrinho (opcional)
        if (carrinhoItemRepo.findByCarrinho(carrinho).isEmpty()) {
            carrinho.setLoja(null);
            carrinhoRepo.save(carrinho);
        }

        return getCarrinhoPorUsuario(idUsuario);
    }

    /* ===================== CLEAR ===================== */

    @Transactional
    public void clearCart(Long idUsuario) {
        var usuario = usuarioRepo.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));
        var cOpt = carrinhoRepo.findByUsuario(usuario);
        if (cOpt.isEmpty()) return;

        var carrinho = cOpt.get();
        carrinhoItemRepo.deleteByCarrinho(carrinho);
        // mantemos o carrinho vazio (sem loja)
        carrinho.setLoja(null);
        carrinhoRepo.save(carrinho);
    }

    /* ===================== CHECKOUT ===================== */

    @Transactional
    public CheckoutResponse checkout(Long idUsuario, CheckoutRequest req) {
        var usuario = usuarioRepo.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        var carrinho = carrinhoRepo.findByUsuario(usuario)
                .orElseThrow(() -> new IllegalArgumentException("Carrinho vazio"));

        var items = carrinhoItemRepo.findByCarrinho(carrinho);
        if (items.isEmpty()) throw new IllegalArgumentException("Carrinho vazio");

        // Loja vem do primeiro item (todos são da mesma loja pela regra)
        var loja = items.get(0).getProduto().getLoja();

        // Monta itens do pedido (e valida estoque)
        List<PedidoItem> pedidoItems = items.stream().map(ci -> {
            var p = ci.getProduto();
            if (p.getEstoque() < ci.getQuantidade())
                throw new IllegalArgumentException("Estoque insuficiente para " + p.getNome());
            return PedidoItem.builder()
                    .produto(p)
                    .nome(p.getNome())
                    .preco(p.getPreco())
                    .quantidade(ci.getQuantidade())
                    .build();
        }).collect(Collectors.toList());

        double total = pedidoItems.stream()
                .mapToDouble(pi -> pi.getPreco() * pi.getQuantidade())
                .sum();

        var pedido = pedidoService.criarPedido(
                usuario, loja, usuario.getNome(), req.formaPagamento,
                total, req.horarioRetirada, pedidoItems
        );

        // “Finaliza” carrinho: limpa itens e deleta o carrinho para nascer outro
        carrinhoItemRepo.deleteByCarrinho(carrinho);
        carrinhoRepo.delete(carrinho);

        CheckoutResponse resp = new CheckoutResponse();
        resp.success = true;
        resp.message = "Pedido criado com sucesso";
        resp.idPedido = pedido.getIdPedido();
        return resp;
    }
}
