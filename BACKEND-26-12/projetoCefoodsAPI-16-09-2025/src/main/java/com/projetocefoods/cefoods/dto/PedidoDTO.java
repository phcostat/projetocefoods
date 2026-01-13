package com.projetocefoods.cefoods.dto;

import java.util.List;

public class PedidoDTO {

    public record PedidoCreate(
            Long idUsuario,
            Long idLoja,
            String formaPagamento,
            String observacao) {
    }

    public record PedidoResponse(
            Long idPedido,
            Long idUsuario,
            Long idLoja,
            String formaPagamento,
            String status,
            String dataPedido,
            String horarioRetirada,
            Double valorTotal,
            String nomeCliente,
            String chavePixLoja,
            List<ItemPedidoDTO.ItemPedidoResponse> itens
    ) {
    }
}
