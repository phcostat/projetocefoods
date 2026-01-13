package com.projetocefoods.cefoods.dto;

import java.time.LocalDateTime;
import java.util.List;

public class NotaDTO {

    public record CreateNota(
        String titulo,
        String texto,
        Long idUsuario,
        Long idLoja
    ) {}

    public record AnexoResponse(
        Long idAnexo,
        String nomeArquivo,
        String tipo,
        Long tamanho
    ) {}

    public record NotaResponse(
        Long idNota,
        String titulo,
        String texto,
        LocalDateTime dataCriacao,
        Long idUsuario,
        Long idLoja,
        List<AnexoResponse> anexos
    ) {}
}
