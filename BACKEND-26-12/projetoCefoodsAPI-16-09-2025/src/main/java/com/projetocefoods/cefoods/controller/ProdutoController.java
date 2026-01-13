package com.projetocefoods.cefoods.controller;

import com.projetocefoods.cefoods.dto.ProdutoDTO.CreateProduto;
import com.projetocefoods.cefoods.model.Produto;
import com.projetocefoods.cefoods.service.FileStorageService;
import com.projetocefoods.cefoods.service.ProdutoService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/produtos")
@RequiredArgsConstructor
public class ProdutoController {

    private final ProdutoService produtoService;
    private final FileStorageService fileStorageService;

    @PostMapping
    public Produto criarProduto(@RequestBody CreateProduto dto) {
        return produtoService.criar(dto);
    }

    @GetMapping
    public List<Produto> listarProdutos() {
        return produtoService.listar();
    }

    @GetMapping("/loja/{idLoja}")
    public List<Produto> listarPorLoja(@PathVariable Long idLoja) {
        return produtoService.listarPorLoja(idLoja);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Produto> buscarProdutoPorId(@PathVariable Long id) {
        return produtoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public Produto atualizarProduto(@PathVariable Long id, @RequestBody CreateProduto dto) {
        return produtoService.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public void deletarProduto(@PathVariable Long id) {
        produtoService.deletar(id);
    }

    @GetMapping("/categoria/{idCategoria}")
    public ResponseEntity<List<Produto>> listarPorCategoria(@PathVariable Integer idCategoria) {
        return ResponseEntity.ok(produtoService.listarPorCategoria(idCategoria));
    }

    @PostMapping("/{id}/imagem")
    public ResponseEntity<Produto> uploadImagem(@PathVariable Long id,
                                                @RequestParam("arquivo") MultipartFile arquivo) {
        String publicUrl = fileStorageService.storeAndGetPublicUrl(arquivo, "produtos");
        Produto atualizado = produtoService.atualizarImagem(id, publicUrl);
        return ResponseEntity.ok(atualizado);
    }

}
