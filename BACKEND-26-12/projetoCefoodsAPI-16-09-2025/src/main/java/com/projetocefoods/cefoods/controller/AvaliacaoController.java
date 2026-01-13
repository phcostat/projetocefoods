package com.projetocefoods.cefoods.controller;

import com.projetocefoods.cefoods.dto.AvaliacaoDTO.CreateAvaliacao;
import com.projetocefoods.cefoods.model.Avaliacao;
import com.projetocefoods.cefoods.service.AvaliacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/avaliacoes")
@RequiredArgsConstructor
public class AvaliacaoController {

    private final AvaliacaoService avaliacaoService;

    @PostMapping
    public ResponseEntity<Avaliacao> avaliar(@RequestBody CreateAvaliacao dto) {
        return ResponseEntity.ok(avaliacaoService.avaliar(dto));
    }

    @GetMapping("/produto/{idProduto}")
    public List<Avaliacao> listarPorProduto(@PathVariable Long idProduto) {
        return avaliacaoService.listarPorProduto(idProduto);
    }

    @GetMapping("/produto/{idProduto}/media")
    public Double media(@PathVariable Long idProduto) {
        return avaliacaoService.calcularMedia(idProduto);
    }
}
