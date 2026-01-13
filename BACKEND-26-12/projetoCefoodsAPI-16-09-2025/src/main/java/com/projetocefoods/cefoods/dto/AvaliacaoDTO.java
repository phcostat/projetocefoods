package com.projetocefoods.cefoods.dto;

public class AvaliacaoDTO {
    public record CreateAvaliacao(
        Long idProduto,
        Long idUsuario,
        int estrelas
    ) {}
}
