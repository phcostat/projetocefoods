package com.projetocefoods.cefoods.dto;

import jakarta.validation.constraints.NotBlank;

public class AuthDTOs {
    public record LoginRequest(@NotBlank String login, @NotBlank String senha) {}
    public record LoginResponse(
    String token,
    String tokenExpiracao,
    Long idUsuario,
    String nome,
    String sobrenome,
    String login,
    String email,
    String telefone,
    String cpf,
    String dataNascimento,
    String tipoUsuario,
    String tipoPerfil,
    Boolean possuiLoja,
    String chavePix,
    String fotoPerfil,
    String dataCadastro,
    Boolean ativo,
    String ultimoAcesso,
    Boolean emailVerificado,
    String tokenRecuperacao
) {}

}