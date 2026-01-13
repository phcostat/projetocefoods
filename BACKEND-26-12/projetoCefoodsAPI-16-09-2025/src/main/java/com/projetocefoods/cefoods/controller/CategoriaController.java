package com.projetocefoods.cefoods.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
//import java.util.Optional;

import com.projetocefoods.cefoods.model.Categoria;
import com.projetocefoods.cefoods.repository.CategoriaRepository;

@RestController
@RequestMapping("/categorias")
public class CategoriaController {

    @Autowired
    private CategoriaRepository categoriaRepository;

    @GetMapping
    public List<Categoria> listarCategorias() {
        return categoriaRepository.findAll();
    }

    @PostMapping
    public Categoria criarCategoria(@RequestBody Categoria categoria) {
        return categoriaRepository.save(categoria);
    }

    @PutMapping("/{id}")
    public Categoria atualizarCategoria(@PathVariable Long id, @RequestBody Categoria novaCategoria) {
        return categoriaRepository.findById(id).map(categoria -> {
            categoria.setNome(novaCategoria.getNome());
            categoria.setDescricao(novaCategoria.getDescricao());
            categoria.setIcone(novaCategoria.getIcone());
            return categoriaRepository.save(categoria);
        }).orElseThrow(() -> new RuntimeException("Categoria não encontrada"));
    }

    @DeleteMapping("/{id}")
    public void deletarCategoria(@PathVariable Long id) {
        categoriaRepository.deleteById(id);
    }
}
