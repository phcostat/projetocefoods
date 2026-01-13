package com.projetocefoods.cefoods.repository;

import com.projetocefoods.cefoods.model.Nota;
import com.projetocefoods.cefoods.model.Loja;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotaRepository extends JpaRepository<Nota, Long> {
    List<Nota> findByLojaIdLojaOrderByDataCriacaoDesc(Long idLoja);
}
