package com.projetocefoods.cefoods.repository;

import com.projetocefoods.cefoods.model.HorarioFuncionamento;
import com.projetocefoods.cefoods.model.Loja;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HorarioFuncionamentoRepository extends JpaRepository<HorarioFuncionamento, Long> {
    List<HorarioFuncionamento> findByLoja(Loja loja);
    void deleteByLoja(Loja loja);
}
