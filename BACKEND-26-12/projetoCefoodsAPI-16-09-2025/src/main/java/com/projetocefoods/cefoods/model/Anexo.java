package com.projetocefoods.cefoods.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tbnota_anexo")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Anexo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idAnexo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idNota", nullable = false)
    @JsonIgnore
    private Nota nota;

    private String nomeArquivo;
    private String tipo;
    private Long tamanho;

    @Lob
    @Column(name = "dados", columnDefinition = "LONGBLOB")
    private byte[] dados;
}

