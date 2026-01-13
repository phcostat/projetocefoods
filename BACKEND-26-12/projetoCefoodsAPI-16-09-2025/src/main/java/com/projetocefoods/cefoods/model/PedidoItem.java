package com.projetocefoods.cefoods.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tbpedido_item")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PedidoItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPedidoItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idPedido", nullable = false)
    private Pedido pedido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idProduto", nullable = false)
    private Produto produto;

    private String nome;
    private Double preco;
    private Integer quantidade;
}
