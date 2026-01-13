package com.projetocefoods.cefoods.repository;

import com.projetocefoods.cefoods.model.Categoria;

//import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
}
