package com.projetocefoods.cefoods.controller;

import com.projetocefoods.cefoods.dto.ComentarioDTO.CreateComentario;
import com.projetocefoods.cefoods.model.Comentario;
import com.projetocefoods.cefoods.service.ComentarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/comentarios")
@RequiredArgsConstructor
public class ComentarioController {

    private final ComentarioService comentarioService;

    // POST - Criar comentário
    @PostMapping
    public ResponseEntity<Comentario> criarComentario(@RequestBody CreateComentario dto) {
        return ResponseEntity.ok(comentarioService.criar(dto));
    }

    // GET - Listar todos os comentários
    @GetMapping
    public List<Comentario> listarTodos() {
        return comentarioService.listarTodos();
    }

    // GET - Listar comentários por produto
    @GetMapping("/produto/{idProduto}")
    public List<Comentario> listarPorProduto(@PathVariable Long idProduto) {
        return comentarioService.listarPorProduto(idProduto);
    }
}
