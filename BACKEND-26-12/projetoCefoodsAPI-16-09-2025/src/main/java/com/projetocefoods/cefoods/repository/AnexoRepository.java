package com.projetocefoods.cefoods.repository;

import com.projetocefoods.cefoods.model.Anexo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnexoRepository extends JpaRepository<Anexo, Long> {
    List<Anexo> findByNotaIdNota(Long idNota);
}
