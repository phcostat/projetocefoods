package com.projetocefoods.cefoods.dto.admin;

import java.util.List;

public class AdminModerationDTOs {

    public record AdminUsuarioStatusUpdateRequest(
            Boolean ativo,
            String motivo
    ) {}

    public record AdminUsuarioStatusResponse(
            Long usuarioId,
            String status,
            Boolean ativo,
            Boolean emailVerificado,
            List<LojaModerationResumo> lojasAfetadas
    ) {}

    public record LojaModerationResumo(
            Long lojaId,
            Boolean status,
            Boolean visivel
    ) {}
}
