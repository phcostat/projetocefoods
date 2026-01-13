package com.projetocefoods.cefoods.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public class UsuarioDTO {
    public record CreateUsuario(
            @NotBlank String nome,
            @NotBlank String login,
            @Email @NotBlank String email,
            @NotBlank String senha,
            String telefone,
            String cpf,
            LocalDate dataNascimento,

            @NotBlank String tipoUsuario, // Ex: "aluno", "professor", etc.
            @NotBlank String tipoPerfil,  // Ex: "admin", "cliente", "vendedor"

            String chavePix,
            String fotoPerfil
    ) {}
}
