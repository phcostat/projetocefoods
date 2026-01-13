package com.projetocefoods.cefoods.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "tbfavoritos")
@IdClass(FavoritoId.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Favorito {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idUsuario", nullable = false)
    @JsonIgnoreProperties({ "senha", "tokenRecuperacao", "hibernateLazyInitializer", "handler" })
    private Usuario usuario;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idProduto", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Produto produto;

    @Column(name = "dataFavorito", nullable = false)
    private LocalDateTime dataFavorito;

    @PrePersist
    public void antesDeSalvar() {
        if (dataFavorito == null) {
            dataFavorito = LocalDateTime.now();
        }
    }
}
