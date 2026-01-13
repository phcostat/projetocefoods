package com.projetocefoods.cefoods.model;

public enum StatusAdministrativoLoja {
    ATIVA,
    EM_ANALISE,
    SUSPENSA;

    public boolean permiteOperacao() {
        return this == ATIVA;
    }
}
