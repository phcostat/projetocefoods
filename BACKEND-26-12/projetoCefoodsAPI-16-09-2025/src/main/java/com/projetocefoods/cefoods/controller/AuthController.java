package com.projetocefoods.cefoods.controller;

import com.projetocefoods.cefoods.config.security.TokenService;
import com.projetocefoods.cefoods.dto.AuthDTOs.LoginRequest;
import com.projetocefoods.cefoods.dto.AuthDTOs.LoginResponse;
import com.projetocefoods.cefoods.model.Token;
import com.projetocefoods.cefoods.model.Usuario;
import com.projetocefoods.cefoods.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.function.Supplier;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {
    private static final Supplier<ResponseEntity<Object>> UNAUTHORIZED =
            () -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login ou senha inválidos");

    private final UsuarioService usuarioService;
    private final TokenService tokenService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Validated LoginRequest req) {
        return usuarioService.buscarPorLoginOuEmail(req.login())
                .filter(usuario -> senhaConfere(usuario.getSenha(), req.senha()))
                .map(usuario -> {
                    if (Boolean.FALSE.equals(usuario.getAtivo())) {
                        return ResponseEntity.status(HttpStatus.LOCKED)
                                .body("Usuario suspenso. Contate o suporte para reativacao.");
                    }
                    usuario.setUltimoAcesso(LocalDateTime.now());
                    usuarioService.salvar(usuario);

                    Token token = tokenService.generateToken(usuario);
                    LoginResponse response = new LoginResponse(
                            token.getToken(),
                            token.getExpiration() != null ? token.getExpiration().toString() : null,
                            usuario.getIdUsuario(),
                            usuario.getNome(),
                            null,
                            usuario.getLogin(),
                            usuario.getEmail(),
                            usuario.getTelefone(),
                            usuario.getCpf(),
                            usuario.getDataNascimento() != null ? usuario.getDataNascimento().toString() : null,
                            usuario.getTipoUsuario(),
                            usuario.getTipoPerfil(),
                            usuario.getPossuiLoja(),
                            usuario.getChavePix(),
                            usuario.getFotoPerfil(),
                            usuario.getDataCadastro() != null ? usuario.getDataCadastro().toString() : null,
                            usuario.getAtivo(),
                            usuario.getUltimoAcesso() != null ? usuario.getUltimoAcesso().toString() : null,
                            usuario.getEmailVerificado(),
                            usuario.getTokenRecuperacao());
                    return ResponseEntity.<Object>ok(response);
                })
                .orElseGet(UNAUTHORIZED);
    }

    private boolean senhaConfere(String senhaArmazenada, String senhaInformada) {
        if (senhaArmazenada == null || senhaInformada == null) {
            return false;
        }
        if (senhaArmazenada.equals(senhaInformada)) {
            return true;
        }
        return passwordEncoder.matches(senhaInformada, senhaArmazenada);
    }
}
