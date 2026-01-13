/*package com.projetocefoods.cefoods.controller;

import com.projetocefoods.cefoods.dto.PedidoDTO;
import com.projetocefoods.cefoods.dto.PedidoDTO.*;
import com.projetocefoods.cefoods.model.StatusPedido;
import com.projetocefoods.cefoods.model.Pedido;
import com.projetocefoods.cefoods.service.PedidoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;

    @PostMapping
    public ResponseEntity<Pedido> criarPedido(@RequestBody PedidoCreate dto) {
        Pedido pedido = pedidoService.criar(dto);
        return ResponseEntity.ok(pedido);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pedido> buscarPedidoPorId(@PathVariable Long id) {
        return pedidoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public List<Pedido> listarPedidos() {
        return pedidoService.listarTodos();
    }

    /*
     * @PutMapping("/{id}/status")
     * public ResponseEntity<Pedido> atualizarStatus(@PathVariable Long
     * id, @RequestParam StatusPedido status) {
     * Pedido pedido = pedidoService.atualizarStatus(id, status);
     * return ResponseEntity.ok(pedido);
     * }
     

    @PutMapping("/{id}/status")
    public ResponseEntity<Pedido> atualizarStatus(@PathVariable Long id,
            @RequestBody PedidoDTO.AtualizarStatusDTO dto) {
        StatusPedido statusEnum = StatusPedido.valueOf(dto.getStatus().toLowerCase());
        Pedido pedidoAtualizado = pedidoService.atualizarStatus(id, statusEnum);
        return ResponseEntity.ok(pedidoAtualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarPedido(@PathVariable Long id) {
        pedidoService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
*/





















package com.projetocefoods.cefoods.controller;

import com.projetocefoods.cefoods.dto.ItemPedidoDTO.ItemPedidoResponse;
import com.projetocefoods.cefoods.dto.PedidoDTO.PedidoResponse;
import com.projetocefoods.cefoods.model.Pedido;
import com.projetocefoods.cefoods.model.PedidoItem;
import com.projetocefoods.cefoods.repository.PedidoRepository;
import com.projetocefoods.cefoods.service.PedidoService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;
/*
@RestController
@RequestMapping("/pedidos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PedidoController {

    private final PedidoRepository pedidoRepo;

    private PedidoResponse toDTO(Pedido pedido) {
        List<ItemPedidoResponse> itens = pedido.getItens() != null
                ? pedido.getItens().stream()
                        .map(i -> new ItemPedidoResponse(
                                pedido.getIdPedido(),
                                i.getProduto().getIdProduto(),
                                i.getProduto().getNome(), // 🔹 envia o nome
                                i.getQuantidade(),
                                i.getPreco(),
                                i.getPreco() * i.getQuantidade()))

                        .collect(Collectors.toList())
                : List.of();

        return new PedidoResponse(
                pedido.getIdPedido(),
                pedido.getUsuario().getIdUsuario(),
                pedido.getLoja().getIdLoja(),
                pedido.getFormaPagamento(),
                pedido.getStatus(),
                pedido.getDataPedido() != null ? pedido.getDataPedido().format(DateTimeFormatter.ISO_DATE_TIME) : null,
                pedido.getHorarioRetirada(),
                pedido.getTotal(),
                pedido.getNomeCliente(), // observação substituído por nomeCliente
                itens);
    }

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<PedidoResponse>> listarPorUsuario(@PathVariable Long idUsuario) {
        List<Pedido> pedidos = pedidoRepo.findByUsuarioIdUsuario(idUsuario);
        List<PedidoResponse> dtos = pedidos.stream().map(this::toDTO).toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/loja/{idLoja}")
    public ResponseEntity<List<PedidoResponse>> listarPorLoja(@PathVariable Long idLoja) {
        List<Pedido> pedidos = pedidoRepo.findByLojaIdLoja(idLoja);
        List<PedidoResponse> dtos = pedidos.stream().map(this::toDTO).toList();
        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    public ResponseEntity<PedidoResponse> criarPedido(@RequestBody Pedido pedido) {
        Pedido novo = pedidoRepo.save(pedido);
        return ResponseEntity.ok(toDTO(novo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PedidoResponse> atualizarPedido(@PathVariable Long id, @RequestBody Pedido atualizado) {
        return pedidoRepo.findById(id).map(p -> {
            atualizado.setIdPedido(id);
            Pedido salvo = pedidoRepo.save(atualizado);
            return ResponseEntity.ok(toDTO(salvo));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<PedidoResponse> atualizarStatus(@PathVariable Long id, @RequestBody Pedido body) {
        return pedidoRepo.findById(id).map(p -> {
            p.setStatus(body.getStatus());
            Pedido salvo = pedidoRepo.save(p);
            return ResponseEntity.ok(toDTO(salvo));
        }).orElse(ResponseEntity.notFound().build());
    }
}*/

@RestController
@RequestMapping("/pedidos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PedidoController {

    private final PedidoService pedidoService;

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<PedidoResponse>> listarPorUsuario(@PathVariable String idUsuario) {
        Long parsedId = parseId(idUsuario);
        if (parsedId == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(pedidoService.listarPorUsuario(parsedId));
    }

    @GetMapping("/loja/{idLoja}")
    public ResponseEntity<List<PedidoResponse>> listarPorLoja(@PathVariable Long idLoja) {
        return ResponseEntity.ok(pedidoService.listarPorLoja(idLoja));
    }

    @PostMapping
    public ResponseEntity<PedidoResponse> criarPedido(@RequestBody Pedido pedido) {
        return ResponseEntity.ok(pedidoService.criarPedidoFromController(pedido));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<PedidoResponse> atualizarStatus(@PathVariable Long id, @RequestBody Pedido body) {
        return pedidoService.atualizarStatus(id, body.getStatus())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
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

