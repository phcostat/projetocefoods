package com.projetocefoods.cefoods.model;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "tbmensagem", indexes = {
        @Index(name = "idx_mensagem_sala", columnList = "sala"),
        @Index(name = "idx_mensagem_destino", columnList = "idUsuarioRecebeu")
})
public class Mensagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idMensagem")
    private Long idMensagem;

    @Column(nullable = false, length = 150)
    private String sala;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idUsuarioEnviou", nullable = false)
    private Usuario usuarioEnviou;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idUsuarioRecebeu", nullable = false)
    private Usuario usuarioRecebeu;

    @Column(name = "mensagem", nullable = false, columnDefinition = "TEXT")
    private String mensagem;

    @Column(name = "anexos", columnDefinition = "TEXT")
    private String anexos;

    @Column(name = "enviadoEm")
    private LocalDateTime enviadoEm;

    @Column(name = "lida")
    private Boolean lida;

    @PrePersist
    public void beforeInsert() {
        if (this.enviadoEm == null) {
            this.enviadoEm = LocalDateTime.now();
        }
        if (this.lida == null) {
            this.lida = Boolean.FALSE;
        }
    }
}
