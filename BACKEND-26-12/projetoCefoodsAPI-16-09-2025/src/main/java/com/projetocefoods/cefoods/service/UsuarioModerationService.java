package com.projetocefoods.cefoods.service;

import com.projetocefoods.cefoods.dto.admin.AdminModerationDTOs.AdminUsuarioStatusResponse;
import com.projetocefoods.cefoods.dto.admin.AdminModerationDTOs.AdminUsuarioStatusUpdateRequest;
import com.projetocefoods.cefoods.dto.admin.AdminModerationDTOs.LojaModerationResumo;
import com.projetocefoods.cefoods.model.Loja;
import com.projetocefoods.cefoods.model.StatusAdministrativoLoja;
import com.projetocefoods.cefoods.model.Usuario;
import com.projetocefoods.cefoods.repository.LojaRepository;
import com.projetocefoods.cefoods.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioModerationService {

    private final UsuarioRepository usuarioRepository;
    private final LojaRepository lojaRepository;

    @Transactional
    public AdminUsuarioStatusResponse atualizarStatusComResumo(Long targetUserId,
                                                               AdminUsuarioStatusUpdateRequest payload,
                                                               Usuario solicitante) {
        if (payload == null || payload.ativo() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Campo 'ativo' é obrigatório.");
        }
        StatusChangeResult result = aplicarStatusInterno(targetUserId, payload.ativo(), solicitante);
        List<LojaModerationResumo> lojas = result.lojas().stream()
                .map(loja -> new LojaModerationResumo(loja.getIdLoja(), loja.getStatus(), loja.getVisivel()))
                .toList();

        Usuario usuario = result.usuario();
        return new AdminUsuarioStatusResponse(
                usuario.getIdUsuario(),
                resolveUsuarioStatus(usuario),
                usuario.getAtivo(),
                usuario.getEmailVerificado(),
                lojas
        );
    }

    @Transactional
    public void aplicarStatus(Usuario usuario, boolean ativo, Usuario solicitante) {
        aplicarStatusInterno(usuario, ativo, solicitante);
    }

    @Transactional
    public Usuario aplicarStatus(Long targetUserId, boolean ativo, Usuario solicitante) {
        StatusChangeResult result = aplicarStatusInterno(targetUserId, ativo, solicitante);
        return result.usuario();
    }

    private StatusChangeResult aplicarStatusInterno(Long targetUserId, boolean ativo, Usuario solicitante) {
        Usuario usuario = usuarioRepository.findById(targetUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
        return aplicarStatusInterno(usuario, ativo, solicitante);
    }

    private StatusChangeResult aplicarStatusInterno(Usuario usuario, boolean ativo, Usuario solicitante) {
        Usuario admin = validarSolicitante(solicitante);
        if (!ativo && isAdmin(usuario)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Contas administrativas não podem ser suspensas.");
        }
        if (!ativo && admin.getIdUsuario() != null && admin.getIdUsuario().equals(usuario.getIdUsuario())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não é possível suspender a própria conta.");
        }

        Boolean estadoAtual = usuario.getAtivo();
        if (estadoAtual != null && Boolean.TRUE.equals(estadoAtual) == ativo) {
            return new StatusChangeResult(usuario, List.of());
        }

        usuario.setAtivo(ativo);
        usuarioRepository.save(usuario);

        List<Loja> lojas = lojaRepository.findByUsuario(usuario);
        if (!lojas.isEmpty()) {
            for (Loja loja : lojas) {
                if (ativo) {
                    loja.setStatus(true);
                    loja.setVisivel(true);
                    loja.setManualOverride(false);
                    loja.setStatusAdm(StatusAdministrativoLoja.ATIVA);
                } else {
                    loja.setStatus(false);
                    loja.setVisivel(false);
                    loja.setManualOverride(true);
                    loja.setStatusAdm(StatusAdministrativoLoja.SUSPENSA);
                }
            }
            lojaRepository.saveAll(lojas);
        }

        return new StatusChangeResult(usuario, lojas);
    }

    private Usuario validarSolicitante(Usuario solicitante) {
        if (solicitante == null || !isAdmin(solicitante)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Apenas administradores podem suspender ou reativar usuários.");
        }
        return solicitante;
    }

    private boolean isAdmin(Usuario usuario) {
        if (usuario == null || usuario.getTipoPerfil() == null) {
            return false;
        }
        return "ADMIN".equalsIgnoreCase(usuario.getTipoPerfil());
    }

    private String resolveUsuarioStatus(Usuario usuario) {
        if (Boolean.FALSE.equals(usuario.getAtivo())) {
            return "suspenso";
        }
        if (Boolean.FALSE.equals(usuario.getEmailVerificado())) {
            return "pendente";
        }
        return "ativo";
    }

    private record StatusChangeResult(Usuario usuario, List<Loja> lojas) {}
}
