 package com.projetocefoods.cefoods.service;
 
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.projetocefoods.cefoods.model.Loja;
import com.projetocefoods.cefoods.model.Notificacao;
import com.projetocefoods.cefoods.model.Usuario;
import com.projetocefoods.cefoods.repository.NotificacaoRepository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificacaoService {

    private final NotificacaoRepository notifRepo;
    private final SimpMessagingTemplate simp;

    public Notificacao criarNotificacaoParaUsuario(String tipo, String titulo, String mensagem,
                                                   Usuario usuario, Loja loja,
                                                   Long pedidoId, Long produtoId, String dadosJson) {
        Notificacao n = Notificacao.builder()
                .tipo(tipo)
                .titulo(titulo)
                .mensagem(mensagem)
                .usuarioDestino(usuario)
                .lojaDestino(loja)
                .pedidoId(pedidoId)
                .produtoId(produtoId)
                .dados(dadosJson)
                .lida(false)
                .dataCriacao(LocalDateTime.now())
                .build();

        notifRepo.save(n);

        // envio realtime
        if (usuario != null && usuario.getIdUsuario() != null) {
            String dest = "/topic/notifications/user-" + usuario.getIdUsuario();
            simp.convertAndSend(dest, toDto(n));
        }

        return n;
    }

    public List<Notificacao> listarPorUsuario(Long idUsuario) {
        return notifRepo.findByUsuarioDestinoIdUsuarioOrderByDataCriacaoDesc(idUsuario);
    }

    public Notificacao marcarComoLida(Long id) {
        return notifRepo.findById(id).map(n -> {
            n.setLida(true);
            return notifRepo.save(n);
        }).orElseThrow(() -> new IllegalArgumentException("Notificação não encontrada"));
    }

    private Map<String, Object> toDto(Notificacao n) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", n.getId());
        dto.put("tipo", n.getTipo());
        dto.put("titulo", n.getTitulo());
        dto.put("mensagem", n.getMensagem());
        dto.put("lida", n.getLida());
        dto.put("pedidoId", n.getPedidoId());
        dto.put("produtoId", n.getProdutoId());
        dto.put("dataCriacao", n.getDataCriacao());
        // opcional: cor/ícone baseados no tipo
        switch (n.getTipo()) {
            case "ORDER_RECEIVED" -> dto.put("color", "blue");
            case "STOCK_LOW" -> dto.put("color", "red");
            case "COMMENT" -> dto.put("color", "purple");
            case "ORDER_PENDING" -> dto.put("color", "yellow");
            case "ORDER_ACCEPTED" -> dto.put("color", "blue");
            case "ORDER_REJECTED" -> dto.put("color", "red");
            case "ORDER_COMPLETED" -> dto.put("color", "green");
            default -> dto.put("color", "gray");
        }
        return dto;
    }
}
