/*package com.projetocefoods.cefoods.service;

//import br.cefetmg.petshop.config.security.TokenService;
//import br.cefetmg.petshop.model.LoginRequest;
//import br.cefetmg.petshop.model.LoginResponse;
//import br.cefetmg.petshop.model.Token;
//import br.cefetmg.petshop.model.Usuario;
//import br.cefetmg.petshop.repository.UsuarioRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
// imports removidos por bypass de autenticação via AuthenticationManager/PasswordEncoder
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.projetocefoods.cefoods.config.security.TokenService;
import com.projetocefoods.cefoods.model.LoginRequest;
import com.projetocefoods.cefoods.model.LoginResponse;
import com.projetocefoods.cefoods.model.Token;
import com.projetocefoods.cefoods.model.Usuario;
import com.projetocefoods.cefoods.repository.UsuarioRepository;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthorizationService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;
    // private final PasswordEncoder passwordEncoder; // TEMP: desativado enquanto comparando senha em claro
    private final TokenService tokenService;

    private static final String lockedExceptionMessage = "Email não verificado, acessar a caixa de correios e clicar no link de validação.";
    private static final String DisabledExceptionMessage = "Usuario desabilitado, procure o suporte técnico.";
    private static final String AuthenticationExceptionMessage = "Login ou senha não conferem.";

    public LoginResponse login(
            LoginRequest data,
            HttpServletRequest request,
            AuthenticationManager authenticationManager)
    {
        // Buscar o usuário no banco
        var usuario = usuarioRepository.findByEmail(data.getEmail()).orElse(null);
        if (usuario == null) {
            log.error(AuthenticationExceptionMessage + " - Usuário inexistente");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, AuthenticationExceptionMessage);
        }

        // Verificações de bloqueio/habilitação
        if (usuario.getEmailVerificado() != null && !usuario.getEmailVerificado()) {
            log.error(lockedExceptionMessage);
            throw new ResponseStatusException(HttpStatus.LOCKED, lockedExceptionMessage);
        }
        if (usuario.getAtivo() != null && !usuario.getAtivo()) {
            log.error(DisabledExceptionMessage);
            throw new ResponseStatusException(HttpStatus.LOCKED, DisabledExceptionMessage);
        }

        // Comparar senha em claro TEMPORARIAMENTE (sem hash)
        if (usuario.getSenha() == null || !usuario.getSenha().equals(data.getSenha())) {
            log.error(AuthenticationExceptionMessage + " - Senha inválida");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, AuthenticationExceptionMessage);
        }

        // Gerar token para o usuário autenticado
        Token token = tokenService.generateToken(usuario);

        var loginResponseDto = new LoginResponse(token, usuario);

        //var defaultResponseDto = new DefaultResponseDto("Login efetuado com sucesso", 200, loginResponseDto);

        return loginResponseDto;
    }

    public Usuario register(Usuario data) {
        //Verificar se o usuario já existe
        Usuario usuario = null;
        try{
            usuario = usuarioRepository.findByEmail(data.getEmail()).orElse(null);
            if (usuario != null) {
                throw new ResponseStatusException(HttpStatus.NOT_ACCEPTABLE, "Usuário já existente");
            }
        }catch (Throwable e){
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro de banco de dados: " + e.getMessage(), e);
        }

    // TEMP: salvar senha em claro (sem hash). Use SOMENTE em desenvolvimento.
        usuario = Usuario.builder()
                .nome(data.getNome())
                .email(data.getEmail())
        .senha(data.getSenha())
                // Usa tipoPerfil informado ou assume COMPRADOR como padrão
                .tipoPerfil((data.getTipoPerfil() == null || data.getTipoPerfil().isBlank()) ? "COMPRADOR" : data.getTipoPerfil())
                .ativo(true)
                .emailVerificado(true)
        .dataCadastro(LocalDateTime.now())
                .build();

        //Tenta inserir no banco de dados o usuario
        try{
            usuario = usuarioRepository.save(usuario);
        }catch (Throwable e){
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro de banco de dados: " + e.getMessage(), e);
        }

        return usuario;
    }

    /*
    public DefaultResponseDto sendRecoveryPassWordLink(AuthenticationDto data) {
        return null;
    }

    public DefaultResponseDto sendRecoveryPassWordEnd(AuthenticationDto data) {
        return null;
    }
    */



/*
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserDetails user = null;
        try{
            user = usuarioRepository.findByEmail(username).orElse(null);
        }catch (Throwable e){
            throw new UsernameNotFoundException("Erro ao consultar usuário pelo email: " + username + " - " + e.getMessage());
        }

        if (user == null) {
            throw new UsernameNotFoundException("Usuário não encontrado: " + username);
        }
        return user;
    }
}
*/
