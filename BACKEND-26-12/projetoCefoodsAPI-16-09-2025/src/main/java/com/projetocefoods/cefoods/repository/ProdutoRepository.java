package com.projetocefoods.cefoods.repository;

import com.projetocefoods.cefoods.model.Produto;
import com.projetocefoods.cefoods.model.Loja;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {
    List<Produto> findByLoja(Loja loja);

    List<Produto> findByCategoria_IdCategoria(Integer idCategoria);

}
