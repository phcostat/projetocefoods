package com.projetocefoods.cefoods.service;

import com.projetocefoods.cefoods.dto.NotaDTO;
import com.projetocefoods.cefoods.model.*;
import com.projetocefoods.cefoods.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotaService {

    private final NotaRepository notaRepo;
    private final AnexoRepository anexoRepo;
    private final UsuarioRepository usuarioRepo;
    private final LojaRepository lojaRepo;

    @Transactional
    public Nota criarNota(String titulo, String texto, Long idUsuario, Long idLoja, MultipartFile[] anexos)
            throws IOException {
        Usuario u = usuarioRepo.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        Loja l = lojaRepo.findById(idLoja)
                .orElseThrow(() -> new IllegalArgumentException("Loja não encontrada"));

        // 🔹 inicializa com lista vazia
        Nota nota = Nota.builder()
                .titulo(titulo)
                .texto(texto)
                .usuario(u)
                .loja(l)
                .dataCriacao(LocalDateTime.now())
                .anexos(new java.util.ArrayList<>()) // garante que não será null
                .build();

        Nota salvo = notaRepo.save(nota);

        if (anexos != null && anexos.length > 0) {
            for (MultipartFile f : anexos) {
                if (f == null || f.isEmpty())
                    continue;

                Anexo a = Anexo.builder()
                        .nota(salvo)
                        .nomeArquivo(f.getOriginalFilename())
                        .tipo(f.getContentType())
                        .tamanho(f.getSize())
                        .dados(f.getBytes())
                        .build();

                // salva anexo e adiciona à lista da nota
                Anexo salvoAnexo = anexoRepo.save(a);
                salvo.getAnexos().add(salvoAnexo);
            }
            // 🔹 força atualização da lista de anexos na nota
            salvo = notaRepo.save(salvo);
        }

        return salvo;
    }

    public List<Nota> listarPorLoja(Long idLoja) {
        return notaRepo.findByLojaIdLojaOrderByDataCriacaoDesc(idLoja);
    }

    public Nota buscarPorId(Long id) {
        return notaRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Nota não encontrada"));
    }

    @Transactional
    public void deletar(Long id) {
        notaRepo.deleteById(id);
    }

    public Anexo buscarAnexo(Long idAnexo) {
        return anexoRepo.findById(idAnexo).orElseThrow(() -> new IllegalArgumentException("Anexo não encontrado"));
    }

    @Transactional
    public Nota editarNota(Long idNota, String titulo, String texto, MultipartFile[] anexos) throws IOException {
        Nota nota = notaRepo.findById(idNota)
                .orElseThrow(() -> new IllegalArgumentException("Nota não encontrada"));

        if (titulo != null && !titulo.isBlank()) {
            nota.setTitulo(titulo);
        }
        if (texto != null) {
            nota.setTexto(texto);
        }

        // Se recebeu novos anexos, adiciona
        if (anexos != null && anexos.length > 0) {
            for (MultipartFile f : anexos) {
                if (f == null || f.isEmpty())
                    continue;

                Anexo a = Anexo.builder()
                        .nota(nota)
                        .nomeArquivo(f.getOriginalFilename())
                        .tipo(f.getContentType())
                        .tamanho(f.getSize())
                        .dados(f.getBytes())
                        .build();

                Anexo salvoAnexo = anexoRepo.save(a);
                nota.getAnexos().add(salvoAnexo);
            }
        }

        return notaRepo.save(nota);
    }

}
