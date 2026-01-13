package com.projetocefoods.cefoods.service;

import com.projetocefoods.cefoods.dto.ProdutoDTO.CreateProduto;
import com.projetocefoods.cefoods.model.Produto;
import com.projetocefoods.cefoods.model.Usuario;
import com.projetocefoods.cefoods.model.Loja;
import com.projetocefoods.cefoods.model.Categoria;
import com.projetocefoods.cefoods.repository.AvaliacaoRepository;
import com.projetocefoods.cefoods.repository.CarrinhoItemRepository;
import com.projetocefoods.cefoods.repository.CategoriaRepository;
import com.projetocefoods.cefoods.repository.ComentarioRepository;
import com.projetocefoods.cefoods.repository.FavoritoRepository;
import com.projetocefoods.cefoods.repository.ItemPedidoRepository;
import com.projetocefoods.cefoods.repository.LojaRepository;
import com.projetocefoods.cefoods.repository.PedidoItemRepository;
import com.projetocefoods.cefoods.repository.ProdutoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.InvalidDataAccessResourceUsageException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProdutoService {

    private static final Logger log = LoggerFactory.getLogger(ProdutoService.class);

    private final ProdutoRepository produtoRepo;
    private final LojaRepository lojaRepo;
    private final CategoriaRepository categoriaRepo;
    private final NotificacaoService notificacaoService;
    private final AvaliacaoRepository avaliacaoRepo;
    private final ComentarioRepository comentarioRepo;
    private final CarrinhoItemRepository carrinhoItemRepo;
    private final FavoritoRepository favoritoRepo;
    private final ItemPedidoRepository itemPedidoRepo;
    private final PedidoItemRepository pedidoItemRepo;
    private final DataSource dataSource;

    public Produto criar(CreateProduto dto) {
        Loja loja = lojaRepo.findById(dto.idLoja())
                .orElseThrow(() -> new IllegalArgumentException("Loja não encontrada"));
        garantirLojaOperante(loja);

        Categoria categoria = categoriaRepo.findById(dto.idCategoria())
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada"));

        Produto produto = Produto.builder()
                .loja(loja)
                .categoria(categoria)
                .nome(dto.nome())
                .descricao(dto.descricao())
                .preco(dto.preco())
                .imagem(dto.imagem())
                .estoque(dto.estoque() != null ? dto.estoque() : 0)
                .estoqueMinimo(dto.estoqueMinimo() != null ? dto.estoqueMinimo() : 0)
                .disponivel(dto.disponivel() != null ? dto.disponivel() : true)
                .dataCadastro(LocalDateTime.now())
                .vezesVendido(0)
                .avaliacaoMedia(0.0)
                .build();

        return produtoRepo.save(produto);
    }

    public List<Produto> listar() {
        return produtoRepo.findAll();
    }

    public Optional<Produto> buscarPorId(Long id) {
        return produtoRepo.findById(id);
    }

    public Produto atualizar(Long id, CreateProduto dto) {
        Produto produto = produtoRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado"));
        garantirLojaOperante(produto.getLoja());

        Loja loja = lojaRepo.findById(dto.idLoja())
                .orElseThrow(() -> new IllegalArgumentException("Loja não encontrada"));
        garantirLojaOperante(loja);

        Categoria categoria = categoriaRepo.findById(dto.idCategoria())
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada"));

        produto.setIdProduto(id);
        produto.setLoja(loja);
        produto.setCategoria(categoria);
        produto.setNome(dto.nome());
        produto.setDescricao(dto.descricao());
        produto.setPreco(dto.preco());
        produto.setImagem(dto.imagem());
        produto.setEstoque(dto.estoque() != null ? dto.estoque() : 0);
        produto.setEstoqueMinimo(dto.estoqueMinimo() != null ? dto.estoqueMinimo() : 0);
        produto.setDisponivel(dto.disponivel() != null ? dto.disponivel() : true);



        if (produto.getEstoque() <= produto.getEstoqueMinimo()) {
            Usuario donoLoja = produto.getLoja().getUsuario();
            notificacaoService.criarNotificacaoParaUsuario(
                    "LOW_STOCK",
                    "Estoque baixo",
                    "Alerta! " + produto.getNome() + " está com estoque baixo.",
                    donoLoja,
                    produto.getLoja(),
                    null,
                    produto.getIdProduto(),
                    null);
        }

        return produtoRepo.save(produto);

    }

    @Transactional
    public void deletar(Long id) {
        Produto produto = produtoRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado para exclusão"));
        garantirLojaOperante(produto.getLoja());
        tentarLimparReferencia("tbcomentario", () -> comentarioRepo.deleteByProduto(produto), "comentarios");
        tentarLimparReferencia("tbavaliacao", () -> avaliacaoRepo.deleteByProduto(produto), "avaliacoes");
        tentarLimparReferencia("tbcarrinho_item", () -> carrinhoItemRepo.deleteByProduto(produto), "itens do carrinho");
        tentarLimparReferencia("tbfavoritos", () -> favoritoRepo.deleteByProduto(produto), "favoritos");
        tentarLimparReferencia("tbitempedido", () -> itemPedidoRepo.deleteByProduto(produto), "itensPedido");
        tentarLimparReferencia("tbpedido_item", () -> pedidoItemRepo.deleteByProduto(produto), "pedidoItem");
        produtoRepo.delete(produto);
    }

    public List<Produto> listarPorLoja(Long idLoja) {
        Loja loja = lojaRepo.findById(idLoja)
                .orElseThrow(() -> new IllegalArgumentException("Loja não encontrada"));

        return produtoRepo.findByLoja(loja);
    }

    public List<Produto> listarPorCategoria(Integer idCategoria) {
        return produtoRepo.findByCategoria_IdCategoria(idCategoria);
    }

    public Produto atualizarImagem(Long idProduto, String novaImagem) {
        Produto produto = produtoRepo.findById(idProduto)
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado"));
        garantirLojaOperante(produto.getLoja());

        produto.setImagem(novaImagem);
        return produtoRepo.save(produto);
    }

    private void garantirLojaOperante(Loja loja) {
        if (loja == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Loja associada ao produto é inválida.");
        }
        if (loja.getStatusAdm() != null && !loja.getStatusAdm().permiteOperacao()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Operação bloqueada: loja suspensa pelo time administrativo.");
        }
    }

    private void tentarLimparReferencia(String tabela, Runnable acao, String origem) {
        if (!tabelaExiste(tabela)) {
            log.debug("Tabela {} não encontrada. Ignorando limpeza de {}.", tabela, origem);
            return;
        }
        try {
            acao.run();
        } catch (InvalidDataAccessResourceUsageException ex) {
            log.warn("Não foi possível limpar registros de {} durante a exclusão do produto: {}", origem, ex.getMessage());
        }
    }

    private boolean tabelaExiste(String tabela) {
        try (Connection connection = dataSource.getConnection()) {
            String catalog = connection.getCatalog();
            try (ResultSet rs = connection.getMetaData().getTables(catalog, null, tabela, null)) {
                if (rs.next()) {
                    return true;
                }
            }
            try (ResultSet rs = connection.getMetaData().getTables(catalog, null, tabela.toUpperCase(), null)) {
                if (rs.next()) {
                    return true;
                }
            }
            try (ResultSet rs = connection.getMetaData().getTables(catalog, null, tabela.toLowerCase(), null)) {
                return rs.next();
            }
        } catch (SQLException ex) {
            log.warn("Não foi possível verificar a existência da tabela {}: {}", tabela, ex.getMessage());
            return false;
        }
    }

}
