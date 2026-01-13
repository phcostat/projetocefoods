package com.projetocefoods.cefoods.dto;

import com.projetocefoods.cefoods.model.PeriodoRelatorio;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class RelatorioDTO {

    private RelatorioDTO() {
    }

    public record CreateRequest(
            Long idLoja,
            PeriodoRelatorio tipoPeriodo,
            LocalDate dataInicio,
            LocalDate dataFim,
            FinanceiroSnapshot resumoFinanceiro
    ) {}

    public record FinanceiroSnapshot(
            Double receitaTotal,
            Double ticketMedio,
            Integer pedidosRecebidos,
            Integer pedidosAceitos,
            Integer pedidosRecusados,
            Integer itensVendidos,
            Double taxaConversao,
            List<TopProduto> topProdutos,
            List<ReceitaDiaria> receitaDiaria,
            String atualizadoEm,
            PeriodoReferencia periodoReferencia
    ) {}

    public record TopProduto(String nome, Double total, Integer quantidade) {}

    public record ReceitaDiaria(String iso, String label, Double total) {}

    public record PeriodoReferencia(String inicio, String fim) {}

    public record RelatorioResponse(
            Long idRelatorio,
            Long idLoja,
            PeriodoRelatorio tipoPeriodo,
            LocalDate dataInicio,
            LocalDate dataFim,
            Double receitaTotal,
            Double ticketMedio,
            Integer pedidosRecebidos,
            Integer pedidosAceitos,
            Integer pedidosRecusados,
            Integer itensVendidos,
            Double taxaConversao,
            String arquivoUrl,
            String status,
            LocalDateTime criadoEm
    ) {}
}
