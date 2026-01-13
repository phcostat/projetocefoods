package com.projetocefoods.cefoods.dto;

import java.util.List;

public class CarrinhoDTO {
    public static class Item {
        public Long produtoId;
        public String nome;
        public Double precoUnit;
        public Integer quantidade;
        public String foto;
        // NÃO precisa de idLoja aqui
    }
    public Long idCarrinho;
    public Long idLoja; // importante: id da loja do carrinho (null quando vazio)
    public List<Item> itens;
}
