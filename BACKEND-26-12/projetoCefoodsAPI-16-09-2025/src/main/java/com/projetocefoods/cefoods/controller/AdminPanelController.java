package com.projetocefoods.cefoods.controller;

import com.projetocefoods.cefoods.dto.admin.AdminConsoleDTOs.AdminPanelDTO;
import com.projetocefoods.cefoods.service.AdminPanelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminPanelController {

    private final AdminPanelService adminPanelService;

    @GetMapping("/panel")
    public ResponseEntity<AdminPanelDTO> getPanel() {
        return ResponseEntity.ok(adminPanelService.buildPanel());
    }
}
