package com.projetocefoods.cefoods.controller;

import com.projetocefoods.cefoods.dto.AddItemRequest;
import com.projetocefoods.cefoods.dto.CarrinhoDTO;
import com.projetocefoods.cefoods.dto.CheckoutRequest;
import com.projetocefoods.cefoods.dto.CheckoutResponse;
import com.projetocefoods.cefoods.service.CarrinhoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/carrinho")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CarrinhoController {

    private final CarrinhoService carrinhoService;

    @GetMapping("/{idUsuario}")
    public ResponseEntity<CarrinhoDTO> getCart(@PathVariable Long idUsuario) {
        return ResponseEntity.ok(carrinhoService.getCarrinhoPorUsuario(idUsuario));
    }

    @PostMapping("/{idUsuario}/items")
    public ResponseEntity<CarrinhoDTO> addItem(@PathVariable Long idUsuario, @RequestBody AddItemRequest req) {
        return ResponseEntity.ok(carrinhoService.addItem(idUsuario, req));
    }

    @PutMapping("/{idUsuario}/items/{produtoId}")
    public ResponseEntity<CarrinhoDTO> updateItem(@PathVariable Long idUsuario,
                                                  @PathVariable Long produtoId,
                                                  @RequestBody Integer quantidade) {
        return ResponseEntity.ok(carrinhoService.updateItem(idUsuario, produtoId, quantidade));
    }

    @DeleteMapping("/{idUsuario}/items/{produtoId}")
    public ResponseEntity<CarrinhoDTO> removeItem(@PathVariable Long idUsuario, @PathVariable Long produtoId) {
        return ResponseEntity.ok(carrinhoService.removeItem(idUsuario, produtoId));
    }

    @DeleteMapping("/{idUsuario}/clear")
    public ResponseEntity<Void> clear(@PathVariable Long idUsuario) {
        carrinhoService.clearCart(idUsuario);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{idUsuario}/checkout")
    public ResponseEntity<CheckoutResponse> checkout(@PathVariable Long idUsuario,
                                                     @RequestBody CheckoutRequest req) {
        return ResponseEntity.ok(carrinhoService.checkout(idUsuario, req));
    }
}
