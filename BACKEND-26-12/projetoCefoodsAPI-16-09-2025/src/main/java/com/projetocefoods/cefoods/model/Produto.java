package com.projetocefoods.cefoods.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tbproduto")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idProduto;

    @ManyToOne
    @JoinColumn(name = "idLoja", nullable = false)
    @JsonIgnoreProperties({ "usuario" }) // Ignora o campo "usuario" dentro da Loja
    private Loja loja;

    @ManyToOne
    @JoinColumn(name = "idCategoria", nullable = false)
    private Categoria categoria;

    private String nome;
    private String descricao;
    private Double preco;
    private String imagem;
    private Integer estoque;
    private Integer estoqueMinimo;
    private Boolean disponivel;
    private LocalDateTime dataCadastro;
    private Integer vezesVendido;

    @Column
    private Double avaliacaoMedia = 0.0;

}
