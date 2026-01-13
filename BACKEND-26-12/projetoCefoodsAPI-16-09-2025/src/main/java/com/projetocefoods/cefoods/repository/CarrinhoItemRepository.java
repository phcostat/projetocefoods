package com.projetocefoods.cefoods.repository;

import com.projetocefoods.cefoods.model.Carrinho;
import com.projetocefoods.cefoods.model.CarrinhoItem;
import com.projetocefoods.cefoods.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CarrinhoItemRepository extends JpaRepository<CarrinhoItem, Long> {
    List<CarrinhoItem> findByCarrinho(Carrinho carrinho);
    Optional<CarrinhoItem> findByCarrinhoAndProduto(Carrinho carrinho, Produto produto);
    void deleteByCarrinho(Carrinho carrinho);
    void deleteByProduto(Produto produto);
}
