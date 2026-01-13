package com.projetocefoods.cefoods.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tbcomentario")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comentario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Geração automática do ID
    private Long id;

    private String texto;

    @Column(name = "nomeUsuario", nullable = false)
    private String nomeUsuario;

    @Column(name = "fotoUsuario")
    private String fotoUsuario;

    private LocalDateTime data;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idProduto", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Produto produto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idUsuario", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private ComentarioStatus status = ComentarioStatus.PENDENTE;

    // Define a data automaticamente ao salvar o comentário
    @PrePersist
    @PreUpdate
    public void preencherCamposAutomaticos() {
        if (this.data == null) {
            this.data = LocalDateTime.now();
        }
        if ((this.nomeUsuario == null || this.nomeUsuario.isBlank()) && this.usuario != null) {
            this.nomeUsuario = resolverNomeUsuario(this.usuario);
        }
        if ((this.fotoUsuario == null || this.fotoUsuario.isBlank()) && this.usuario != null) {
            this.fotoUsuario = this.usuario.getFotoPerfil();
        }
        if (this.status == null) {
            this.status = ComentarioStatus.PENDENTE;
        }
    }

    private String resolverNomeUsuario(Usuario usuario) {
        if (usuario.getNome() != null && !usuario.getNome().isBlank()) {
            return usuario.getNome();
        }
        if (usuario.getLogin() != null && !usuario.getLogin().isBlank()) {
            return usuario.getLogin();
        }
        if (usuario.getEmail() != null && !usuario.getEmail().isBlank()) {
            return usuario.getEmail();
        }
        return "Usuario" + (usuario.getIdUsuario() != null ? usuario.getIdUsuario() : "");
    }
}
