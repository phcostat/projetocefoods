package com.projetocefoods.cefoods.controller;

import com.projetocefoods.cefoods.dto.admin.AdminModerationDTOs.AdminUsuarioStatusResponse;
import com.projetocefoods.cefoods.dto.admin.AdminModerationDTOs.AdminUsuarioStatusUpdateRequest;
import com.projetocefoods.cefoods.model.Usuario;
import com.projetocefoods.cefoods.service.UsuarioModerationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminUsuarioModerationController {

    private final UsuarioModerationService usuarioModerationService;

    @PatchMapping("/{id}/status")
    public ResponseEntity<AdminUsuarioStatusResponse> atualizarStatus(
            @PathVariable("id") Long usuarioId,
            @RequestBody AdminUsuarioStatusUpdateRequest request,
            @AuthenticationPrincipal Usuario solicitante) {
        AdminUsuarioStatusResponse response = usuarioModerationService
                .atualizarStatusComResumo(usuarioId, request, solicitante);
        return ResponseEntity.ok(response);
    }
}
