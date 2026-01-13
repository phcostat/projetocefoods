package com.projetocefoods.cefoods.controller;

import com.projetocefoods.cefoods.dto.ItemPedidoDTO.*;
import com.projetocefoods.cefoods.model.ItemPedido;
import com.projetocefoods.cefoods.service.ItemPedidoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/itenspedido")
@RequiredArgsConstructor
public class ItemPedidoController {

    private final ItemPedidoService itemPedidoService;

    // GET - Listar todos os itens de pedido
    @GetMapping
    public ResponseEntity<List<ItemPedido>> listarTodosItens() {
        List<ItemPedido> itens = itemPedidoService.listarTodos();
        return ResponseEntity.ok(itens);
    }

    // POST - Criar item de pedido
    @PostMapping
    public ResponseEntity<ItemPedido> criarItem(@RequestBody ItemPedidoCreate dto) {
        ItemPedido item = itemPedidoService.criar(dto);
        return ResponseEntity.ok(item);
    }

    // GET - Listar itens por pedido
    @GetMapping("/pedido/{idPedido}")
    public ResponseEntity<List<ItemPedido>> listarItensPorPedido(@PathVariable Long idPedido) {
        List<ItemPedido> itens = itemPedidoService.listarPorPedido(idPedido);
        return ResponseEntity.ok(itens);
    }

    // GET - Buscar item por ID composto (pedido + produto)
    @GetMapping("/{idPedido}/{idProduto}")
    public ResponseEntity<ItemPedido> buscarItem(@PathVariable Long idPedido, @PathVariable Long idProduto) {
        ItemPedido item = itemPedidoService.buscarPorId(idPedido, idProduto);
        return ResponseEntity.ok(item);
    }

    // PUT - Atualizar item
    @PutMapping("/{idPedido}/{idProduto}")
    public ResponseEntity<ItemPedido> atualizarItem(
            @PathVariable Long idPedido,
            @PathVariable Long idProduto,
            @RequestBody ItemPedidoUpdate dto) {
        ItemPedido atualizado = itemPedidoService.atualizar(idPedido, idProduto, dto);
        return ResponseEntity.ok(atualizado);
    }

    // DELETE - Remover item
    @DeleteMapping("/{idPedido}/{idProduto}")
    public ResponseEntity<Void> deletarItem(@PathVariable Long idPedido, @PathVariable Long idProduto) {
        itemPedidoService.deletar(idPedido, idProduto);
        return ResponseEntity.noContent().build();
    }
}
