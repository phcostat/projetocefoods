package com.projetocefoods.cefoods.dto;

public class ItemPedidoDTO {

    public record ItemPedidoCreate(
            Long idPedido,
            Long idProduto,
            Integer quantidade,
            Double precoUnitario) {
    }

    public record ItemPedidoResponse(
            Long idPedido,
            Long idProduto,
            String nomeProduto, // 🔹 novo campo
            Integer quantidade,
            Double precoUnitario,
            Double subtotal) {
    }

    public record ItemPedidoUpdate(
            Integer quantidade,
            Double precoUnitario) {
    }
}
