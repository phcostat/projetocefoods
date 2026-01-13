package com.projetocefoods.cefoods.controller;

import com.projetocefoods.cefoods.dto.HorarioFuncionamentoDTO;
import com.projetocefoods.cefoods.dto.LojaDTO.CreateLoja;
import com.projetocefoods.cefoods.dto.LojaDTO.UpdateLoja;
import com.projetocefoods.cefoods.dto.LojaDTO.UpdateLojaStatusReq;
import com.projetocefoods.cefoods.dto.LojaResponse;
import com.projetocefoods.cefoods.service.FileStorageService;
import com.projetocefoods.cefoods.service.LojaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping({"/lojas", "/loja"})
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:8100", "http://localhost:8101", "http://127.0.0.1:8100", "http://127.0.0.1:8101"})
public class LojaController {
    private final LojaService service;
    private final FileStorageService fileStorageService;

    @PostMapping
    public ResponseEntity<LojaResponse> criar(@RequestBody CreateLoja dto) {
        System.out.println("Recebido CreateLoja no backend: idUsuario=" + dto.idUsuario() + ", status=" + dto.status());
        return ResponseEntity.ok(service.criar(dto));
    }

    @GetMapping({"", "/"})
    public ResponseEntity<List<LojaResponse>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @GetMapping({"/usuario/{idUsuario}", "/minha-loja/{idUsuario}"})
    public ResponseEntity<List<LojaResponse>> porUsuario(@PathVariable("idUsuario") String idUsuario) {
        Long parsedId = parseId(idUsuario);
        if (parsedId == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(service.listarPorUsuario(parsedId));
    }

    @GetMapping("/minha-loja")
    public ResponseEntity<LojaResponse> minhaLojaSemId(@RequestParam(name = "idUsuario", required = false) String idUsuario) {
        Long parsedId = parseId(idUsuario);
        if (parsedId == null) {
            return ResponseEntity.noContent().build();
        }
        return service.listarPorUsuario(parsedId).stream()
                .findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LojaResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PutMapping({"/{id}", "/atualizar/{id}"})
    public ResponseEntity<LojaResponse> atualizar(@PathVariable Long id, @RequestBody UpdateLoja dto) {
        return ResponseEntity.ok(service.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.desativarLoja(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{idLoja}/horarios")
    public ResponseEntity<List<HorarioFuncionamentoDTO>> listarHorarios(@PathVariable Long idLoja) {
        return ResponseEntity.ok(service.listarHorarios(idLoja));
    }

    @PutMapping({"/{idLoja}/horarios", "/horarios/{idLoja}"})
    public ResponseEntity<Void> atualizarHorarios(
            @PathVariable Long idLoja,
            @RequestBody List<HorarioFuncionamentoDTO> novosHorarios) {
        service.atualizarHorarios(idLoja, novosHorarios);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping({"/{idLoja}/status", "/status/{idLoja}"})
    public ResponseEntity<LojaResponse> atualizarStatus(
            @PathVariable Long idLoja,
            @RequestBody UpdateLojaStatusReq dto) {
        return ResponseEntity.ok(service.atualizarStatus(idLoja, dto));
    }

    @PostMapping("/criar-loja")
    public ResponseEntity<LojaResponse> criarCompat(@RequestBody CreateLoja dto) {
        return criar(dto);
    }

    @PostMapping("/{id}/foto-capa")
    public ResponseEntity<LojaResponse> uploadFotoCapa(@PathVariable("id") Long id,
                                                       @RequestParam("arquivo") MultipartFile arquivo) {
        String publicUrl = fileStorageService.storeAndGetPublicUrl(arquivo, "lojas");
        return ResponseEntity.ok(service.atualizarFotoCapa(id, publicUrl));
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
