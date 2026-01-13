package com.projetocefoods.cefoods.controller;

import com.projetocefoods.cefoods.dto.ComentarioDTO.UpdateComentarioStatus;
import com.projetocefoods.cefoods.model.Comentario;
import com.projetocefoods.cefoods.model.ComentarioStatus;
import com.projetocefoods.cefoods.service.ComentarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/comentarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminComentarioController {

    private final ComentarioService comentarioService;

    @PatchMapping("/{id}/status")
    public ResponseEntity<Comentario> atualizarStatus(@PathVariable Long id,
                                                      @RequestBody UpdateComentarioStatus payload) {
        ComentarioStatus status = parseStatus(payload);
        Comentario atualizado = comentarioService.atualizarStatus(id, status);
        return ResponseEntity.ok(atualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        comentarioService.remover(id);
        return ResponseEntity.noContent().build();
    }

    private ComentarioStatus parseStatus(UpdateComentarioStatus payload) {
        if (payload == null || payload.status() == null) {
            return ComentarioStatus.PENDENTE;
        }
        try {
            return ComentarioStatus.valueOf(payload.status().trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return ComentarioStatus.PENDENTE;
        }
    }
}
