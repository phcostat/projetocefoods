package com.projetocefoods.cefoods.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tbCategoria")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCategoria;

    private String nome;

    private String descricao;

    private String icone;

    // ➤ Nenhum relacionamento com Produto
}
