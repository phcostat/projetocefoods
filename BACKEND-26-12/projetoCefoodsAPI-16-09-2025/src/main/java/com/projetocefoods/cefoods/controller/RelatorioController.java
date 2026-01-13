package com.projetocefoods.cefoods.controller;

import com.projetocefoods.cefoods.dto.RelatorioDTO;
import com.projetocefoods.cefoods.service.RelatorioService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/relatorios")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RelatorioController {

    private final RelatorioService relatorioService;

    @PostMapping
    public ResponseEntity<RelatorioDTO.RelatorioResponse> gerar(@RequestBody RelatorioDTO.CreateRequest request) {
        return ResponseEntity.ok(relatorioService.gerar(request));
    }

    @GetMapping("/loja/{idLoja}")
    public ResponseEntity<List<RelatorioDTO.RelatorioResponse>> listarPorLoja(@PathVariable Long idLoja) {
        return ResponseEntity.ok(relatorioService.listarPorLoja(idLoja));
    }

    @GetMapping("/{idRelatorio}/arquivo")
    public ResponseEntity<ByteArrayResource> download(@PathVariable Long idRelatorio) {
        RelatorioService.RelatorioArquivo arquivo = relatorioService.baixarArquivo(idRelatorio);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + arquivo.filename() + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(arquivo.resource());
    }
}
