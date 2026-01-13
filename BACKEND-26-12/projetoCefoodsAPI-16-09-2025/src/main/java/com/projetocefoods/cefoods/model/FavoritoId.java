package com.projetocefoods.cefoods.model;

import java.io.Serializable;
import java.util.Objects;

public class FavoritoId implements Serializable {

    private Long usuario;
    private Long produto;

    public FavoritoId() {}

    public FavoritoId(Long usuario, Long produto) {
        this.usuario = usuario;
        this.produto = produto;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof FavoritoId that)) return false;
        return Objects.equals(usuario, that.usuario) &&
                Objects.equals(produto, that.produto);
    }

    @Override
    public int hashCode() {
        return Objects.hash(usuario, produto);
    }
}
