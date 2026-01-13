package com.projetocefoods.cefoods.repository;

import com.projetocefoods.cefoods.model.PedidoItem;
import com.projetocefoods.cefoods.model.Pedido;
import com.projetocefoods.cefoods.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PedidoItemRepository extends JpaRepository<PedidoItem, Long> {
    List<PedidoItem> findByPedido(Pedido pedido);
    List<PedidoItem> findByPedidoIdPedido(Long idPedido);
    void deleteByProduto(Produto produto);
}
