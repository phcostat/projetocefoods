package com.projetocefoods.cefoods.model;

import java.io.Serializable;
import java.util.Objects;

public class ItemPedidoId implements Serializable {
    private Long pedido;
    private Long produto;

    public ItemPedidoId() {}

    public ItemPedidoId(Long pedido, Long produto) {
        this.pedido = pedido;
        this.produto = produto;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ItemPedidoId)) return false;
        ItemPedidoId that = (ItemPedidoId) o;
        return Objects.equals(pedido, that.pedido) &&
               Objects.equals(produto, that.produto);
    }

    @Override
    public int hashCode() {
        return Objects.hash(pedido, produto);
    }
}
