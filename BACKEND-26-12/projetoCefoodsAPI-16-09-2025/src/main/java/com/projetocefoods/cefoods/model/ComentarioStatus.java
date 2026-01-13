package com.projetocefoods.cefoods.model;

public enum ComentarioStatus {
    PENDENTE,
    APROVADO,
    OCULTO,
    REMOVIDO;

    public String asLabel() {
        return name().toLowerCase();
    }
}
