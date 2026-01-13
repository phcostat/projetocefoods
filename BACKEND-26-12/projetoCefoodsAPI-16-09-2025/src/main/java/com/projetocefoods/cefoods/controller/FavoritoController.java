package com.projetocefoods.cefoods.controller;

import com.projetocefoods.cefoods.dto.FavoritoDTO.CreateFavorito;
import com.projetocefoods.cefoods.dto.FavoritoDTO.FavoritoResponse;
import com.projetocefoods.cefoods.model.Produto;
import com.projetocefoods.cefoods.service.FavoritoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/favoritos")
@RequiredArgsConstructor
public class FavoritoController {

    private final FavoritoService favoritoService;

    @PostMapping
    public ResponseEntity<FavoritoResponse> favoritar(@RequestBody CreateFavorito dto) {
        return ResponseEntity.ok(favoritoService.favoritar(dto.idUsuario(), dto.idProduto()));
    }

    @DeleteMapping("/usuario/{idUsuario}/produto/{idProduto}")
    public ResponseEntity<Void> desfavoritar(@PathVariable Long idUsuario, @PathVariable Long idProduto) {
        favoritoService.desfavoritar(idUsuario, idProduto);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/usuario/{idUsuario}")
    public List<Produto> listarPorUsuario(@PathVariable Long idUsuario) {
        return favoritoService.listarProdutosFavoritos(idUsuario);
    }

    @GetMapping("/usuario/{idUsuario}/produto/{idProduto}")
    public ResponseEntity<Boolean> ehFavorito(@PathVariable Long idUsuario, @PathVariable Long idProduto) {
        return ResponseEntity.ok(favoritoService.isFavorito(idUsuario, idProduto));
    }
}
