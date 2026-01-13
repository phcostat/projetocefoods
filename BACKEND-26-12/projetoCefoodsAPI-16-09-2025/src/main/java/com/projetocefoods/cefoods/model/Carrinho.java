package com.projetocefoods.cefoods.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tbcarrinho")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Carrinho {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCarrinho;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idUsuario", nullable = false)
    private Usuario usuario;

    // Carrinho.java
    @ManyToOne(optional = true)
    @JoinColumn(name = "idLoja", nullable = true)
    private Loja loja; // pode ser null

    private LocalDateTime criadoEm;
}
