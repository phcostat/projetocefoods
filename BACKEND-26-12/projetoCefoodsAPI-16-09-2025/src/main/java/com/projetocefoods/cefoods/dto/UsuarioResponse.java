package com.projetocefoods.cefoods.dto;

public record UsuarioResponse(
    Long idUsuario,
    String nome,
    String email,
    String login
) {}
