package com.projetocefoods.cefoods.controller;

import com.projetocefoods.cefoods.dto.NotaDTO;
import com.projetocefoods.cefoods.model.Anexo;
import com.projetocefoods.cefoods.model.Nota;
import com.projetocefoods.cefoods.service.NotaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/notas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotaController {

    private final NotaService notaService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<NotaDTO.NotaResponse> criarNota(
            @RequestParam("titulo") String titulo,
            @RequestParam(value = "texto", required = false) String texto,
            @RequestParam("idUsuario") Long idUsuario,
            @RequestParam("idLoja") Long idLoja,
            @RequestPart(value = "anexos", required = false) MultipartFile[] anexos) throws Exception {
        Nota salvo = notaService.criarNota(titulo, texto, idUsuario, idLoja, anexos);
        return ResponseEntity.ok(toResponse(salvo));
    }

    @GetMapping("/loja/{idLoja}")
    public ResponseEntity<List<NotaDTO.NotaResponse>> listarPorLoja(@PathVariable Long idLoja) {
        List<Nota> list = notaService.listarPorLoja(idLoja);
        return ResponseEntity.ok(list.stream().map(this::toResponse).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotaDTO.NotaResponse> buscarPorId(@PathVariable Long id) {
        Nota n = notaService.buscarPorId(id);
        return ResponseEntity.ok(toResponse(n));
    }

    /*@DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        notaService.deletar(id);
        return ResponseEntity.noContent().build();
    }*/

    @GetMapping("/{idNota}/anexos/{idAnexo}")
    public ResponseEntity<byte[]> downloadAnexo(@PathVariable Long idNota, @PathVariable Long idAnexo) {
        Anexo a = notaService.buscarAnexo(idAnexo);
        if (!a.getNota().getIdNota().equals(idNota)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(
                MediaType.parseMediaType(a.getTipo() == null ? "application/octet-stream" : a.getTipo()));
        headers.setContentDisposition(ContentDisposition.builder("attachment").filename(a.getNomeArquivo()).build());
        return new ResponseEntity<>(a.getDados(), headers, HttpStatus.OK);
    }

    private NotaDTO.NotaResponse toResponse(Nota n) {
        List<NotaDTO.AnexoResponse> anexos = n.getAnexos() == null ? List.of()
                : n.getAnexos().stream()
                        .map(a -> new NotaDTO.AnexoResponse(a.getIdAnexo(), a.getNomeArquivo(), a.getTipo(),
                                a.getTamanho()))
                        .collect(Collectors.toList());

        return new NotaDTO.NotaResponse(
                n.getIdNota(),
                n.getTitulo(),
                n.getTexto(),
                n.getDataCriacao(),
                n.getUsuario() != null ? n.getUsuario().getIdUsuario() : null,
                n.getLoja() != null ? n.getLoja().getIdLoja() : null,
                anexos);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<NotaDTO.NotaResponse> editarNota(
            @PathVariable Long id,
            @RequestParam(value = "titulo", required = false) String titulo,
            @RequestParam(value = "texto", required = false) String texto,
            @RequestPart(value = "anexos", required = false) MultipartFile[] anexos) throws Exception {
        Nota atualizado = notaService.editarNota(id, titulo, texto, anexos);
        return ResponseEntity.ok(toResponse(atualizado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarNota(@PathVariable Long id) {
        notaService.deletar(id);
        return ResponseEntity.noContent().build();
    }

}
