package com.projetocefoods.cefoods.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tbitempedido")
@IdClass(ItemPedidoId.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemPedido {

    @Id
    @ManyToOne
    @JoinColumn(name = "idPedido", nullable = false)
    private Pedido pedido;

    @Id
    @ManyToOne
    @JoinColumn(name = "idProduto", nullable = false)
    private Produto produto;

    private Integer quantidade;

    private Double precoUnitario;

    @Column(insertable = false, updatable = false)
    private Double subtotal;

}
