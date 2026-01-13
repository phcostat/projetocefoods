package com.projetocefoods.cefoods.repository;

import com.projetocefoods.cefoods.model.Avaliacao;
import com.projetocefoods.cefoods.model.Produto;
import com.projetocefoods.cefoods.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {
    List<Avaliacao> findByProduto(Produto produto);
    Optional<Avaliacao> findByProdutoAndUsuario(Produto produto, Usuario usuario);
    void deleteByProduto(Produto produto);
}
