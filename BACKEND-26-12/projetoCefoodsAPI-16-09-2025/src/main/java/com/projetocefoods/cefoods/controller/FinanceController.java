/*package com.projetocefoods.cefoods.controller;

import com.projetocefoods.cefoods.service.PedidoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/financas")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class FinanceController {
    private final PedidoService pedidoService;

    // Regra de negócio atendida: SOMENTE pedidos CONCLUÍDOS entram na receita
    @GetMapping("/resumo")
    public ResponseEntity<?> resumo(@RequestParam Long idLoja,
                                    @RequestParam(required = false) String inicio,
                                    @RequestParam(required = false) String fim){
        LocalDateTime ini = inicio == null ? LocalDate.now().atStartOfDay() : LocalDate.parse(inicio).atStartOfDay();
        LocalDateTime end = fim == null ? LocalDate.now().atTime(23,59,59) : LocalDate.parse(fim).atTime(23,59,59);
        double receita = pedidoService.receitaPeriodo(idLoja, ini, end);
        return ResponseEntity.ok(new Object(){ public final double totalReceita = receita; public final String de = ini.toString(); public final String ate = end.toString();});
    }
}*/