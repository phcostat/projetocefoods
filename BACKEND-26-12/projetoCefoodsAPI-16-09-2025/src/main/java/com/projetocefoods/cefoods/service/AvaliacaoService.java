package com.projetocefoods.cefoods.service;

import com.projetocefoods.cefoods.dto.AvaliacaoDTO.CreateAvaliacao;
import com.projetocefoods.cefoods.model.Avaliacao;
import com.projetocefoods.cefoods.model.Produto;
import com.projetocefoods.cefoods.model.Usuario;
import com.projetocefoods.cefoods.repository.AvaliacaoRepository;
import com.projetocefoods.cefoods.repository.ProdutoRepository;
import com.projetocefoods.cefoods.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AvaliacaoService {

    private final AvaliacaoRepository avaliacaoRepo;
    private final ProdutoRepository produtoRepo;
    private final UsuarioRepository usuarioRepo;

    public Avaliacao avaliar(CreateAvaliacao dto) {
        Produto produto = produtoRepo.findById(dto.idProduto())
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado"));
        Usuario usuario = usuarioRepo.findById(dto.idUsuario())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        Avaliacao existente = avaliacaoRepo.findByProdutoAndUsuario(produto, usuario).orElse(null);

        if (existente != null) {
            existente.setEstrelas(dto.estrelas());
            avaliacaoRepo.save(existente);
        } else {
            existente = Avaliacao.builder()
                    .produto(produto)
                    .usuario(usuario)
                    .estrelas(dto.estrelas())
                    .build();
            avaliacaoRepo.save(existente);
        }

        // 🔹 Recalcular média e atualizar produto
        double media = avaliacaoRepo.findByProduto(produto)
                .stream()
                .mapToDouble(Avaliacao::getEstrelas)
                .average()
                .orElse(0.0);

        produto.setAvaliacaoMedia(media);
        produtoRepo.save(produto);

        return existente;
    }

    public List<Avaliacao> listarPorProduto(Long idProduto) {
        Produto produto = produtoRepo.findById(idProduto)
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado"));
        return avaliacaoRepo.findByProduto(produto);
    }

    public Double calcularMedia(Long idProduto) {
        Produto produto = produtoRepo.findById(idProduto)
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado"));
        return avaliacaoRepo.findByProduto(produto)
                .stream()
                .mapToDouble(Avaliacao::getEstrelas)
                .average()
                .orElse(0.0);
    }

}
