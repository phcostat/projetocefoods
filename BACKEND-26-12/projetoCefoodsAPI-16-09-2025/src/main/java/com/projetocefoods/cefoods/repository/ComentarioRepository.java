package com.projetocefoods.cefoods.repository;

import com.projetocefoods.cefoods.model.Comentario;
import com.projetocefoods.cefoods.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComentarioRepository extends JpaRepository<Comentario, Long> {
    List<Comentario> findByProduto(Produto produto);
    void deleteByProduto(Produto produto);
}
