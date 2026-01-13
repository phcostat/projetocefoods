package com.projetocefoods.cefoods.dto;

import lombok.Data;

@Data
public class CarrinhoItemRequest {
    private Long produtoId;
    private int quantidade;
}
