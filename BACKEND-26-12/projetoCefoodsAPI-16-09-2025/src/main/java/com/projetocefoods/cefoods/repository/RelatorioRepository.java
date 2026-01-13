package com.projetocefoods.cefoods.repository;

import com.projetocefoods.cefoods.model.Relatorio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RelatorioRepository extends JpaRepository<Relatorio, Long> {
    List<Relatorio> findByLojaIdLojaOrderByCriadoEmDesc(Long idLoja);
}
