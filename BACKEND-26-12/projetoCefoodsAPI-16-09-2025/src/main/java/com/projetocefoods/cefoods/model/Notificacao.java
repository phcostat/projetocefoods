package com.projetocefoods.cefoods.model;

// package com.projetocefoods.cefoods.model;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tbnotificacao")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notificacao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tipo; // e.g. ORDER_RECEIVED, LOW_STOCK, COMMENT, ORDER_STATUS

    private String titulo;
    @Column(columnDefinition = "TEXT")
    private String mensagem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_destino")
    private Usuario usuarioDestino;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_loja_destino")
    private Loja lojaDestino;

    @Column(name = "pedido_id")
    private Long pedidoId;

    @Column(name = "produto_id")
    private Long produtoId;

    @Column(columnDefinition = "json")
    private String dados;

    private Boolean lida = false;

    @Column(name = "data_criacao")
    private LocalDateTime dataCriacao = LocalDateTime.now();
}
