package com.projetocefoods.cefoods.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ProdutoDTO {
    public record CreateProduto(
            Long idLoja,
            Long idCategoria,
            String nome,
            String descricao,
            Double preco,
            String imagem,
            Integer estoque,
            Integer estoqueMinimo,
            Boolean disponivel) {
    }
}
