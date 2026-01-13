package com.projetocefoods.cefoods.controller;

import com.projetocefoods.cefoods.dto.LojaDTO.UpdateLojaStatusAdmReq;
import com.projetocefoods.cefoods.dto.LojaDTO.UpdateLojaStatusReq;
import com.projetocefoods.cefoods.dto.LojaResponse;
import com.projetocefoods.cefoods.model.Usuario;
import com.projetocefoods.cefoods.service.LojaService;
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
@RequestMapping("/api/v1/admin/lojas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminLojaModerationController {

    private final LojaService lojaService;

    @PatchMapping("/{idLoja}/status-adm")
    public ResponseEntity<LojaResponse> atualizarStatusAdm(
            @PathVariable Long idLoja,
            @RequestBody UpdateLojaStatusAdmReq dto,
            @AuthenticationPrincipal Usuario solicitante) {
        return ResponseEntity.ok(lojaService.atualizarStatusAdministrativo(idLoja, dto, solicitante));
    }

    @PatchMapping("/{idLoja}/status")
    public ResponseEntity<LojaResponse> atualizarStatusOperacional(
            @PathVariable Long idLoja,
            @RequestBody UpdateLojaStatusReq dto,
            @AuthenticationPrincipal Usuario solicitante) {
        return ResponseEntity.ok(lojaService.atualizarStatusComoAdmin(idLoja, dto, solicitante));
    }
}
