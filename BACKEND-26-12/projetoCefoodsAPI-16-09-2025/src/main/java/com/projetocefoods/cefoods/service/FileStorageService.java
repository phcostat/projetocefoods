package com.projetocefoods.cefoods.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path rootLocation;

    public FileStorageService(@Value("${app.upload-dir:uploads}") String uploadDir) {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootLocation);
        } catch (IOException ex) {
            throw new IllegalStateException("Não foi possível criar diretório de uploads", ex);
        }
    }

    public String storeAndGetPublicUrl(MultipartFile arquivo, String subpasta) {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new IllegalArgumentException("Arquivo não pode estar vazio");
        }

        String extensao = extrairExtensao(arquivo.getOriginalFilename());
        String nomeArquivo = UUID.randomUUID() + extensao;

        try {
            Path destino = resolveDestino(subpasta).resolve(nomeArquivo);
            Files.createDirectories(destino.getParent());
            Files.copy(arquivo.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new IllegalStateException("Erro ao salvar arquivo", ex);
        }

        String relativePath = construirPathPublico(subpasta, nomeArquivo);
        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path(relativePath)
                .toUriString();
    }

    public StoredFileInfo storeBytes(byte[] conteudo, String subpasta, String extensao) {
        if (conteudo == null || conteudo.length == 0) {
            throw new IllegalArgumentException("Conteúdo do arquivo não pode estar vazio");
        }

        String safeExtension = (extensao != null && extensao.startsWith(".")) ? extensao : ".bin";
        String nomeArquivo = UUID.randomUUID() + safeExtension;
        Path destino = resolveDestino(subpasta).resolve(nomeArquivo);

        try {
            Files.createDirectories(destino.getParent());
            Files.write(destino, conteudo);
        } catch (IOException ex) {
            throw new IllegalStateException("Erro ao salvar arquivo", ex);
        }

        String publicUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path(construirPathPublico(subpasta, nomeArquivo))
                .toUriString();

        return new StoredFileInfo(publicUrl, destino.toAbsolutePath().toString());
    }

    private Path resolveDestino(String subpasta) {
        if (StringUtils.hasText(subpasta)) {
            return rootLocation.resolve(Paths.get(subpasta).normalize());
        }
        return rootLocation;
    }

    private String construirPathPublico(String subpasta, String nomeArquivo) {
        StringBuilder builder = new StringBuilder("/uploads/");
        if (StringUtils.hasText(subpasta)) {
            builder.append(subpasta.trim());
            if (!subpasta.trim().endsWith("/")) {
                builder.append('/');
            }
        }
        builder.append(nomeArquivo);
        return builder.toString().replace("//", "/");
    }

    private String extrairExtensao(String original) {
        if (!StringUtils.hasText(original)) {
            return "";
        }
        String nomeLimpo = Paths.get(original).getFileName().toString();
        int idx = nomeLimpo.lastIndexOf('.');
        return idx >= 0 ? nomeLimpo.substring(idx) : "";
    }

    public record StoredFileInfo(String publicUrl, String absolutePath) {}
}
