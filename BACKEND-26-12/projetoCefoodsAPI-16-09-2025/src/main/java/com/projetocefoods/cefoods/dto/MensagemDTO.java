package com.projetocefoods.cefoods.dto;

import java.time.LocalDateTime;

public class MensagemDTO {

    public record MensagemRequest(
            String sala,
            Long idUsuarioEnviada,
            Long idUsuarioRecebida,
            String mensagem,
            String anexos) {
    }

    public record MensagemResponse(
            Long idMensagem,
            String sala,
            Long idUsuarioEnviada,
            Long idUsuarioRecebida,
            String mensagem,
            String anexos,
            Boolean lida,
            LocalDateTime enviadoEm) {
    }

    public record ConversaResumo(
            String sala,
            Long otherId,
            String otherName,
            String lojaNome,
            String avatarUrl,
            String lastMessage,
            LocalDateTime lastAt,
            Integer unread) {
    }
}
