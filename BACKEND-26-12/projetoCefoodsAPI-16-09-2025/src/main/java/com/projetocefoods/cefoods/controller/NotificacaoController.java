package com.projetocefoods.cefoods.controller;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.projetocefoods.cefoods.model.Notificacao;
import com.projetocefoods.cefoods.service.NotificacaoService;

import java.util.List;

@RestController
@RequestMapping("/notificacoes")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:8100", "http://localhost:8101", "http://127.0.0.1:8100", "http://127.0.0.1:8101"})
public class NotificacaoController {

    private final NotificacaoService notifService;

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<Notificacao>> listarPorUsuario(@PathVariable String idUsuario) {
        Long parsedId = parseId(idUsuario);
        if (parsedId == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(notifService.listarPorUsuario(parsedId));
    }

    @PutMapping("/{id}/lida")
    public ResponseEntity<Notificacao> marcarComoLida(@PathVariable Long id) {
        return ResponseEntity.ok(notifService.marcarComoLida(id));
    }

    private Long parseId(String raw) {
        if (raw == null) {
            return null;
        }
        String trimmed = raw.trim();
        if (trimmed.isEmpty() || "undefined".equalsIgnoreCase(trimmed) || "null".equalsIgnoreCase(trimmed)) {
            return null;
        }
        try {
            long parsed = Long.parseLong(trimmed);
            return parsed > 0 ? parsed : null;
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}
