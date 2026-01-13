package com.projetocefoods.cefoods.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.projetocefoods.cefoods.model.StatusAdministrativoLoja;

import static com.projetocefoods.cefoods.model.StatusAdministrativoLoja.ATIVA;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "tbloja")
public class Loja {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idLoja")
    private Long idLoja;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idUsuario", nullable = false)
    private Usuario usuario;

    private String nomeFantasia;
    @Column(length = 1000)
    private String descricao;
    private String fotoCapa;
    private String localizacao;

    private Boolean status;

    private Boolean manualOverride; // ✅ novo campo

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "statusAdm", nullable = false, length = 20)
    private StatusAdministrativoLoja statusAdm = ATIVA;

    private Boolean visivel;
    private Boolean aceitaPix;
    private Boolean aceitaDinheiro;
    private Boolean aceitaCartao;

    private LocalDateTime dataCriacao;
    private Integer qtdProdutosVendidos;
    private Double avaliacaoMedia;
    private Integer totalPedidos;
}
