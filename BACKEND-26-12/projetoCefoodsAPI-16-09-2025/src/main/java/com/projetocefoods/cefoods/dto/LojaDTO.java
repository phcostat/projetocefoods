package com.projetocefoods.cefoods.dto;

import java.util.List;

import com.projetocefoods.cefoods.model.StatusAdministrativoLoja;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class LojaDTO {

    public record CreateLoja(
            @NotNull Long idUsuario,
            @NotBlank String nomeFantasia,
            String descricao,
            String fotoCapa,
            String localizacao,
            String horarioAbertura,
            String horarioFechamento,
            Boolean status,
            Boolean visivel,
            Boolean aceitaPix,
            Boolean aceitaDinheiro,
            Boolean aceitaCartao,
            StatusAdministrativoLoja statusAdm,

            // ✅ Novo campo para turnos abertos
            List<HorarioFuncionamentoDTO> horariosFuncionamento) {
    }

    public record UpdateLoja(
            String nomeFantasia,
            String descricao,
            String fotoCapa,
            String localizacao,
            String horarioAbertura,
            String horarioFechamento,
            Boolean status,
            Boolean visivel,
            Boolean aceitaPix,
            Boolean aceitaDinheiro,
            Boolean aceitaCartao) {
    }

    public record UpdateLojaStatusReq(
        @NotNull Boolean status,
        Boolean manualOverride // ✅ permite o toggle manual
) {}

    public record UpdateLojaStatusAdmReq(
            @NotNull StatusAdministrativoLoja statusAdm,
            String motivo
    ) {}

}
