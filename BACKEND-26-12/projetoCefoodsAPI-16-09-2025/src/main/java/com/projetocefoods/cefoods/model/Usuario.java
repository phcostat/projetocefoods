package com.projetocefoods.cefoods.model;
//PAREI AQUI COM A API
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "tbusuario")
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idUsuario")
    private Long idUsuario;

    private String nome;
    private String login;
    private String email;
    private String senha;
    private String telefone;
    private String cpf;

    @Column(name = "dataNascimento")
    private LocalDate dataNascimento;

    @Column(name = "tipoUsuario")
    private String tipoUsuario;

    @Column(name = "tipoPerfil")
    private String tipoPerfil;

    @Column(name = "chavePix")
    private String chavePix;

    @Column(name = "fotoPerfil")
    private String fotoPerfil;

    @Column(name = "dataCadastro")
    private LocalDateTime dataCadastro;

    private Boolean ativo;

    @Column(name = "ultimoAcesso")
    private LocalDateTime ultimoAcesso;

    @Column(name = "emailVerificado")
    private Boolean emailVerificado;

    @Column(name = "tokenRecuperacao")
    private String tokenRecuperacao;

    @Column(name = "possuiLoja")
    private Boolean possuiLoja;

    // ===== UserDetails (Spring Security) =====
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String perfil = (this.tipoPerfil == null || this.tipoPerfil.isBlank()) ? "COMPRADOR" : this.tipoPerfil.trim();
        return List.of(new SimpleGrantedAuthority("ROLE_" + perfil.toUpperCase()));
    }

    @Override
    public String getPassword() {
        return this.senha;
    }

    @Override
    public String getUsername() {
        // Usaremos o email como username
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        // Se email não verificado, considera travada (locked)
        return this.emailVerificado == null || this.emailVerificado;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        // Se ativo for null, considera habilitado
        return this.ativo == null || this.ativo;
    }

    // Normaliza perfil antes de salvar/atualizar
    @PrePersist
    @PreUpdate
    private void normalizeFields() {
        if (this.tipoPerfil != null) {
            this.tipoPerfil = this.tipoPerfil.trim().toUpperCase();
        }
    }
}
