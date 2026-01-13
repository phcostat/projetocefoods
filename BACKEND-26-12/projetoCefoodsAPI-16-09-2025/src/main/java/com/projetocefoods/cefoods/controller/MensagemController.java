package com.projetocefoods.cefoods.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.projetocefoods.cefoods.dto.MensagemDTO;
import com.projetocefoods.cefoods.service.MensagemService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/mensagens")
@CrossOrigin(origins = {"http://localhost:8100", "http://localhost:8101", "http://127.0.0.1:8100", "http://127.0.0.1:8101"})
public class MensagemController {

    private final MensagemService mensagemService;

    @GetMapping("/sala/{sala}")
    public ResponseEntity<List<MensagemDTO.MensagemResponse>> listarPorSala(@PathVariable String sala,
            @RequestParam(name = "viewerId", required = false) Long viewerId) {
        return ResponseEntity.ok(mensagemService.buscarPorSala(sala, viewerId));
    }

    @GetMapping("/conversas/{idUsuario}")
    public ResponseEntity<List<MensagemDTO.ConversaResumo>> listarConversas(@PathVariable Long idUsuario) {
        return ResponseEntity.ok(mensagemService.listarConversas(idUsuario));
    }

    @PostMapping
    public ResponseEntity<MensagemDTO.MensagemResponse> enviar(@RequestBody MensagemDTO.MensagemRequest request) {
        return ResponseEntity.ok(mensagemService.enviarMensagem(request));
    }

    @MessageMapping("/chat.sendMessage")
    public void receberViaWebSocket(MensagemDTO.MensagemRequest request) {
        mensagemService.enviarMensagem(request);
    }
}
