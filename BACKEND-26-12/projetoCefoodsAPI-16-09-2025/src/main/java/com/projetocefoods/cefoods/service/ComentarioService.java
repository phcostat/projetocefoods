package com.projetocefoods.cefoods.service;

import com.projetocefoods.cefoods.dto.ComentarioDTO.CreateComentario;
import com.projetocefoods.cefoods.model.Comentario;
import com.projetocefoods.cefoods.model.ComentarioStatus;
import com.projetocefoods.cefoods.model.Produto;
import com.projetocefoods.cefoods.model.Usuario;
import com.projetocefoods.cefoods.repository.ComentarioRepository;
import com.projetocefoods.cefoods.repository.ProdutoRepository;
import com.projetocefoods.cefoods.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
/*
@Service
@RequiredArgsConstructor
public class ComentarioService {

    private final ComentarioRepository comentarioRepo;
    private final ProdutoRepository produtoRepo;
    private final UsuarioRepository usuarioRepo;

    public Comentario criar(CreateComentario dto) {
        Produto produto = produtoRepo.findById(dto.idProduto())
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado"));
        Usuario usuario = usuarioRepo.findById(dto.idUsuario())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        String nomeUsuario = usuario.getNome();
        if (nomeUsuario == null || nomeUsuario.isBlank()) {
            nomeUsuario = usuario.getLogin() != null && !usuario.getLogin().isBlank()
                    ? usuario.getLogin()
                    : (usuario.getEmail() != null ? usuario.getEmail() : "Usuário" + usuario.getIdUsuario());
        }

        Comentario comentario = Comentario.builder()
                .texto(dto.texto())
                .nomeUsuario(nomeUsuario)
                .fotoUsuario(usuario.getFotoPerfil())
                .produto(produto)
                .usuario(usuario)
                .build();

        return comentarioRepo.save(comentario);
    }

    public List<Comentario> listarPorProduto(Long idProduto) {
        Produto produto = produtoRepo.findById(idProduto)
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado"));
        return comentarioRepo.findByProduto(produto);
    }

    public List<Comentario> listarTodos() {
        return comentarioRepo.findAll();
    }
}
*/

@Service
@RequiredArgsConstructor
public class ComentarioService {

    private final ComentarioRepository comentarioRepo;
    private final ProdutoRepository produtoRepo;
    private final UsuarioRepository usuarioRepo;
    private final NotificacaoService notificacaoService;

    public Comentario criar(CreateComentario dto) {
        Produto produto = produtoRepo.findById(dto.idProduto())
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado"));
        Usuario usuario = usuarioRepo.findById(dto.idUsuario())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        Comentario comentario = Comentario.builder()
                .texto(dto.texto())
                .produto(produto)
                .usuario(usuario)
                .status(ComentarioStatus.PENDENTE)
                .build();

        Comentario salvo = comentarioRepo.save(comentario);

        // 🔔 Notificar o dono da loja
        notificacaoService.criarNotificacaoParaUsuario(
                "COMMENT",
                "Novo comentário",
                "O produto " + produto.getNome() + " recebeu um comentário de " + usuario.getNome(),
                produto.getLoja().getUsuario(),
                produto.getLoja(),
                null,
                produto.getIdProduto(),
                null
        );

        return salvo;
    }

    public List<Comentario> listarPorProduto(Long idProduto) {
                Produto produto = produtoRepo.findById(idProduto)
                                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado"));
                return comentarioRepo.findByProduto(produto).stream()
                                .filter(c -> c.getStatus() != ComentarioStatus.REMOVIDO)
                                .filter(c -> c.getStatus() != ComentarioStatus.OCULTO)
                                .toList();
    }

    public List<Comentario> listarTodos() {
        return comentarioRepo.findAll();
    }

        public Comentario atualizarStatus(Long idComentario, ComentarioStatus status) {
                Comentario comentario = comentarioRepo.findById(idComentario)
                                .orElseThrow(() -> new IllegalArgumentException("Comentário não encontrado"));
                comentario.setStatus(status != null ? status : ComentarioStatus.PENDENTE);
                return comentarioRepo.save(comentario);
        }

        public void remover(Long idComentario) {
                if (!comentarioRepo.existsById(idComentario)) {
                        throw new IllegalArgumentException("Comentário não encontrado");
                }
                comentarioRepo.deleteById(idComentario);
        }
}
