package com.projetocefoods.cefoods.dto;

import java.time.LocalDate;

public class ComentarioDTO {
    public record CreateComentario(
        String texto,
        LocalDate data,
        Long idProduto,
        Long idUsuario
    ) {}

    public record UpdateComentarioStatus(
        String status
    ) {}
}
