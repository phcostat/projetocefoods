// src/main/java/com/projetocefoods/cefoods/dto/UsuarioUpdateDTO.java
package com.projetocefoods.cefoods.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UsuarioUpdateDTO {
    private String nome;
    private String login;
    private String email;
    private String senha;
    private String telefone;
    private String cpf;
    private LocalDate dataNascimento;
    private String tipoUsuario;
    private String tipoPerfil;
    private String chavePix;
    private String fotoPerfil;
    private Boolean ativo;
    private Boolean emailVerificado;
    private String tokenRecuperacao;
    private LocalDateTime ultimoAcesso;
    private Boolean possuiLoja;

    // getters e setters (pode usar Lombok @Getter @Setter também)
}
