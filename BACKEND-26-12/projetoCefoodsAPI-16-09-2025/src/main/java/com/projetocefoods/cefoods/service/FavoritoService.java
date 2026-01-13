package com.projetocefoods.cefoods.service;

import com.projetocefoods.cefoods.dto.FavoritoDTO.FavoritoResponse;
import com.projetocefoods.cefoods.model.Favorito;
import com.projetocefoods.cefoods.model.Produto;
import com.projetocefoods.cefoods.model.Usuario;
import com.projetocefoods.cefoods.repository.FavoritoRepository;
import com.projetocefoods.cefoods.repository.ProdutoRepository;
import com.projetocefoods.cefoods.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoritoService {

    private final FavoritoRepository favoritoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProdutoRepository produtoRepository;

    public FavoritoResponse favoritar(Long idUsuario, Long idProduto) {
        Favorito existente = favoritoRepository
                .findByUsuario_IdUsuarioAndProduto_IdProduto(idUsuario, idProduto)
                .orElse(null);

        if (existente != null) {
            return toResponse(existente);
        }

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));
        Produto produto = produtoRepository.findById(idProduto)
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado"));

        Favorito novo = Favorito.builder()
                .usuario(usuario)
                .produto(produto)
                .dataFavorito(LocalDateTime.now())
                .build();

        Favorito salvo = favoritoRepository.save(novo);
        return toResponse(salvo);
    }

    public void desfavoritar(Long idUsuario, Long idProduto) {
        favoritoRepository.deleteByUsuario_IdUsuarioAndProduto_IdProduto(idUsuario, idProduto);
    }

    public List<Produto> listarProdutosFavoritos(Long idUsuario) {
        usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        return favoritoRepository.findByUsuario_IdUsuario(idUsuario)
                .stream()
                .map(Favorito::getProduto)
                .collect(Collectors.toList());
    }

    public boolean isFavorito(Long idUsuario, Long idProduto) {
        return favoritoRepository.existsByUsuario_IdUsuarioAndProduto_IdProduto(idUsuario, idProduto);
    }

    private FavoritoResponse toResponse(Favorito favorito) {
        return new FavoritoResponse(
                favorito.getUsuario().getIdUsuario(),
                favorito.getProduto().getIdProduto(),
                favorito.getDataFavorito(),
                favorito.getProduto()
        );
    }
}
