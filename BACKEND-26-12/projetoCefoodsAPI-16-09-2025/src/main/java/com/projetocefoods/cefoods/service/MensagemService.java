package com.projetocefoods.cefoods.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.projetocefoods.cefoods.dto.MensagemDTO;
import com.projetocefoods.cefoods.model.Loja;
import com.projetocefoods.cefoods.model.Mensagem;
import com.projetocefoods.cefoods.model.Usuario;
import com.projetocefoods.cefoods.repository.LojaRepository;
import com.projetocefoods.cefoods.repository.MensagemRepository;
import com.projetocefoods.cefoods.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MensagemService {

    private final MensagemRepository mensagemRepository;
    private final UsuarioRepository usuarioRepository;
    private final LojaRepository lojaRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public MensagemDTO.MensagemResponse enviarMensagem(MensagemDTO.MensagemRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Payload da mensagem não pode ser nulo");
        }
        Long remetenteId = request.idUsuarioEnviada();
        Long destinatarioId = request.idUsuarioRecebida();
        if (remetenteId == null || destinatarioId == null) {
            throw new IllegalArgumentException("Remetente e destinatário são obrigatórios");
        }
        Usuario remetente = usuarioRepository.findById(remetenteId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário remetente não encontrado"));
        Usuario destinatario = usuarioRepository.findById(destinatarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário destinatário não encontrado"));

        String corpo = Optional.ofNullable(request.mensagem()).map(String::trim).orElse("");
        if (!StringUtils.hasText(corpo)) {
            throw new IllegalArgumentException("Mensagem não pode ser vazia");
        }

        String salaNormalizada = normalizeSala(request.sala(), remetenteId, destinatarioId);

        Mensagem novaMensagem = Mensagem.builder()
                .sala(salaNormalizada)
                .usuarioEnviou(remetente)
                .usuarioRecebeu(destinatario)
                .mensagem(corpo)
                .anexos(request.anexos())
                .lida(Boolean.FALSE)
                .enviadoEm(LocalDateTime.now())
                .build();

        Mensagem salva = mensagemRepository.save(novaMensagem);
        MensagemDTO.MensagemResponse response = toResponse(salva);

        messagingTemplate.convertAndSend("/topic/chat." + salaNormalizada, response);
        return response;
    }

    @Transactional
    public List<MensagemDTO.MensagemResponse> buscarPorSala(String sala, Long viewerId) {
        if (!StringUtils.hasText(sala)) {
            return List.of();
        }
        List<Mensagem> mensagens = mensagemRepository.findBySalaOrderByEnviadoEmAsc(sala.trim());
        if (viewerId != null) {
            boolean updated = false;
            for (Mensagem mensagem : mensagens) {
                boolean usuarioEhDestino = Optional.ofNullable(mensagem.getUsuarioRecebeu())
                        .map(Usuario::getIdUsuario)
                        .filter(id -> Objects.equals(id, viewerId))
                        .isPresent();
                if (usuarioEhDestino && !Boolean.TRUE.equals(mensagem.getLida())) {
                    mensagem.setLida(Boolean.TRUE);
                    updated = true;
                }
            }
            if (updated) {
                mensagemRepository.saveAll(mensagens);
            }
        }
        return mensagens.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MensagemDTO.ConversaResumo> listarConversas(Long usuarioId) {
        if (usuarioId == null || usuarioId <= 0) {
            return List.of();
        }
        List<Mensagem> historico = mensagemRepository.findAllByParticipante(usuarioId);
        Map<String, Mensagem> ultimaPorSala = new LinkedHashMap<>();
        Map<String, Long> naoLidasPorSala = new LinkedHashMap<>();

        for (Mensagem m : historico) {
            ultimaPorSala.putIfAbsent(m.getSala(), m);
            boolean usuarioEhDestino = Optional.ofNullable(m.getUsuarioRecebeu())
                    .map(Usuario::getIdUsuario)
                    .filter(id -> Objects.equals(id, usuarioId))
                    .isPresent();
            boolean lida = Boolean.TRUE.equals(m.getLida());
            if (usuarioEhDestino && !lida) {
                naoLidasPorSala.merge(m.getSala(), 1L, Long::sum);
            }
        }

        Map<Long, Loja> cacheLoja = new LinkedHashMap<>();
        List<MensagemDTO.ConversaResumo> resposta = new ArrayList<>();
        for (Mensagem mensagem : ultimaPorSala.values()) {
            Usuario outro = resolverOutroUsuario(mensagem, usuarioId);
            Long outroId = outro != null ? outro.getIdUsuario() : null;
            String outroNome = outro != null ? outro.getNome() : null;
            Loja lojaAssociada = null;
            String lojaNome = null;
            if (outroId != null) {
                if (!cacheLoja.containsKey(outroId)) {
                    cacheLoja.put(outroId, lojaRepository.findFirstByUsuarioIdUsuario(outroId).orElse(null));
                }
                lojaAssociada = cacheLoja.get(outroId);
                if (lojaAssociada != null) {
                    lojaNome = lojaAssociada.getNomeFantasia();
                }
            }
            String avatarUrl = (outro != null && StringUtils.hasText(outro.getFotoPerfil())) ? outro.getFotoPerfil() : null;
            if (!StringUtils.hasText(avatarUrl) && lojaAssociada != null && StringUtils.hasText(lojaAssociada.getFotoCapa())) {
                avatarUrl = lojaAssociada.getFotoCapa();
            }
            resposta.add(new MensagemDTO.ConversaResumo(
                    mensagem.getSala(),
                    outroId,
                    outroNome,
                    lojaNome,
                    avatarUrl,
                    preview(mensagem.getMensagem()),
                    mensagem.getEnviadoEm(),
                    naoLidasPorSala.getOrDefault(mensagem.getSala(), 0L).intValue()));
        }
        resposta.sort((a, b) -> {
            LocalDateTime bTime = b.lastAt();
            LocalDateTime aTime = a.lastAt();
            if (bTime == null && aTime == null) return 0;
            if (bTime == null) return -1;
            if (aTime == null) return 1;
            return bTime.compareTo(aTime);
        });
        return resposta;
    }

    private MensagemDTO.MensagemResponse toResponse(Mensagem mensagem) {
        return new MensagemDTO.MensagemResponse(
                mensagem.getIdMensagem(),
                mensagem.getSala(),
                Optional.ofNullable(mensagem.getUsuarioEnviou()).map(Usuario::getIdUsuario).orElse(null),
                Optional.ofNullable(mensagem.getUsuarioRecebeu()).map(Usuario::getIdUsuario).orElse(null),
                mensagem.getMensagem(),
                mensagem.getAnexos(),
                mensagem.getLida(),
                mensagem.getEnviadoEm());
    }

    private String preview(String texto) {
        if (!StringUtils.hasText(texto)) {
            return "";
        }
        String normalized = texto.trim().replaceAll("\\s+", " ");
        return normalized.length() > 120 ? normalized.substring(0, 117) + "..." : normalized;
    }

    private Usuario resolverOutroUsuario(Mensagem mensagem, Long usuarioAtual) {
        if (mensagem.getUsuarioEnviou() != null && !Objects.equals(mensagem.getUsuarioEnviou().getIdUsuario(), usuarioAtual)) {
            return mensagem.getUsuarioEnviou();
        }
        return mensagem.getUsuarioRecebeu();
    }

    private String normalizeSala(String sala, Long remetenteId, Long destinatarioId) {
        if (StringUtils.hasText(sala)) {
            return sala.trim().toLowerCase(Locale.ROOT);
        }
        long menor = Math.min(remetenteId, destinatarioId);
        long maior = Math.max(remetenteId, destinatarioId);
        return "chat-" + menor + "-" + maior;
    }
}
