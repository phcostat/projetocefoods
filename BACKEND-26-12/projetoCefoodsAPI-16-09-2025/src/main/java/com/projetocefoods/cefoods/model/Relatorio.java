package com.projetocefoods.cefoods.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tbrelatorio")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Relatorio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_relatorio")
    private Long idRelatorio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_loja", nullable = false)
    private Loja loja;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_periodo")
    private PeriodoRelatorio tipoPeriodo;

    @Column(name = "data_inicio")
    private LocalDate dataInicio;
    @Column(name = "data_fim")
    private LocalDate dataFim;

    @Column(name = "receita_total")
    private Double receitaTotal;
    @Column(name = "ticket_medio")
    private Double ticketMedio;
    @Column(name = "pedidos_recebidos")
    private Integer pedidosRecebidos;
    @Column(name = "pedidos_aceitos")
    private Integer pedidosAceitos;
    @Column(name = "pedidos_recusados")
    private Integer pedidosRecusados;
    @Column(name = "itens_vendidos")
    private Integer itensVendidos;
    @Column(name = "taxa_conversao")
    private Double taxaConversao;

    @Column(name = "arquivo_url")
    private String arquivoUrl;
    @Column(name = "arquivo_path")
    private String arquivoPath;
    private String status;

    @Column(name = "resumo_json", columnDefinition = "TEXT")
    private String resumoJson;

    @Column(name = "criado_em")
    private LocalDateTime criadoEm;
}
