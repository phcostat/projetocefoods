package com.projetocefoods.cefoods.repository;

import com.projetocefoods.cefoods.model.Favorito;
import com.projetocefoods.cefoods.model.FavoritoId;
import com.projetocefoods.cefoods.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoritoRepository extends JpaRepository<Favorito, FavoritoId> {

    List<Favorito> findByUsuario_IdUsuario(Long idUsuario);

    Optional<Favorito> findByUsuario_IdUsuarioAndProduto_IdProduto(Long idUsuario, Long idProduto);

    boolean existsByUsuario_IdUsuarioAndProduto_IdProduto(Long idUsuario, Long idProduto);

    void deleteByUsuario_IdUsuarioAndProduto_IdProduto(Long idUsuario, Long idProduto);

    void deleteByProduto(Produto produto);
}
