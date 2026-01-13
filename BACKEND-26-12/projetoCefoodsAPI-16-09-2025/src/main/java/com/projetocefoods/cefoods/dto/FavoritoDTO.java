package com.projetocefoods.cefoods.dto;

import com.projetocefoods.cefoods.model.Produto;

import java.time.LocalDateTime;

public class FavoritoDTO {

    public record CreateFavorito(Long idUsuario, Long idProduto) {}

    public record FavoritoResponse(Long idUsuario,
                                   Long idProduto,
                                   LocalDateTime dataFavorito,
                                   Produto produto) {}
}
