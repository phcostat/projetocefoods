package com.projetocefoods.cefoods.controller;

import com.projetocefoods.cefoods.dto.UsuarioUpdateDTO;
import com.projetocefoods.cefoods.model.Usuario;
import com.projetocefoods.cefoods.repository.UsuarioRepository;
import com.projetocefoods.cefoods.service.FileStorageService;
import com.projetocefoods.cefoods.service.UsuarioModerationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private UsuarioModerationService usuarioModerationService;

    // GET - Listar todos os usuários
    @GetMapping
    public List<Usuario> listar() {
        return usuarioRepository.findAll();
    }

    // GET - Buscar usuário por ID
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> buscarPorId(@PathVariable("id") Long id) {
        Optional<Usuario> usuario = usuarioRepository.findById(id);
        return usuario.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST - Criar novo usuário
    @PostMapping
    public Usuario salvar(@RequestBody Usuario usuario) {
        if (usuario.getAtivo() == null) usuario.setAtivo(true); // evita NULL em coluna NOT NULL
        if (usuario.getDataCadastro() == null) usuario.setDataCadastro(LocalDateTime.now()); // evita NULL em dataCadastro
        return usuarioRepository.save(usuario);
    }

    // PUT - Atualizar usuário existente
    @PutMapping("/{id}")
    public ResponseEntity<Usuario> atualizar(@PathVariable("id") Long id, @RequestBody UsuarioUpdateDTO dto) {
        Optional<Usuario> usuarioOptional = usuarioRepository.findById(id);

        if (usuarioOptional.isPresent()) {
            Usuario usuario = usuarioOptional.get();

            // Atualizar apenas campos não nulos
            if (dto.getNome() != null)
                usuario.setNome(dto.getNome());
            if (dto.getLogin() != null)
                usuario.setLogin(dto.getLogin());
            if (dto.getEmail() != null)
                usuario.setEmail(dto.getEmail());

            // Aqui está o cuidado com a senha
            if (dto.getSenha() != null && !dto.getSenha().isEmpty()) {
                usuario.setSenha(dto.getSenha());
            }

            if (dto.getTelefone() != null)
                usuario.setTelefone(dto.getTelefone());
            if (dto.getCpf() != null)
                usuario.setCpf(dto.getCpf());
            if (dto.getDataNascimento() != null)
                usuario.setDataNascimento(dto.getDataNascimento());
            if (dto.getTipoUsuario() != null)
                usuario.setTipoUsuario(dto.getTipoUsuario());
            if (dto.getTipoPerfil() != null)
                usuario.setTipoPerfil(dto.getTipoPerfil());
            if (dto.getChavePix() != null)
                usuario.setChavePix(dto.getChavePix());
            if (dto.getFotoPerfil() != null)
                usuario.setFotoPerfil(dto.getFotoPerfil());
            if (dto.getAtivo() != null && !dto.getAtivo().equals(usuario.getAtivo())) {
                Usuario solicitante = resolveSolicitante();
                usuarioModerationService.aplicarStatus(usuario, dto.getAtivo(), solicitante);
            }
            if (dto.getEmailVerificado() != null)
                usuario.setEmailVerificado(dto.getEmailVerificado());
            if (dto.getTokenRecuperacao() != null)
                usuario.setTokenRecuperacao(dto.getTokenRecuperacao());
            if (dto.getUltimoAcesso() != null)
                usuario.setUltimoAcesso(dto.getUltimoAcesso());
            if (dto.getPossuiLoja() != null)
                usuario.setPossuiLoja(dto.getPossuiLoja());

            Usuario atualizado = usuarioRepository.save(usuario);
            return ResponseEntity.ok(atualizado);
        }

        return ResponseEntity.notFound().build();
    }

    // DELETE - Excluir usuário
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (usuarioRepository.existsById(id)) {
            usuarioRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/foto")
    public ResponseEntity<Usuario> uploadFotoPerfil(@PathVariable("id") Long id,
                                                    @RequestParam("arquivo") MultipartFile arquivo) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));

        String publicUrl = fileStorageService.storeAndGetPublicUrl(arquivo, "usuarios");
        usuario.setFotoPerfil(publicUrl);
        Usuario atualizado = usuarioRepository.save(usuario);
        return ResponseEntity.ok(atualizado);
    }

    private Usuario resolveSolicitante() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return null;
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof Usuario usuario) {
            return usuario;
        }
        return null;
    }
}
