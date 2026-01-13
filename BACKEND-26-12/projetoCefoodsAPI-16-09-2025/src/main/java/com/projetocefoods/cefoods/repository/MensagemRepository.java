package com.projetocefoods.cefoods.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.projetocefoods.cefoods.model.Mensagem;

@Repository
public interface MensagemRepository extends JpaRepository<Mensagem, Long> {

    List<Mensagem> findBySalaOrderByEnviadoEmAsc(String sala);

    @Query("SELECT m FROM Mensagem m WHERE m.usuarioEnviou.idUsuario = :userId OR m.usuarioRecebeu.idUsuario = :userId ORDER BY m.enviadoEm DESC")
    List<Mensagem> findAllByParticipante(Long userId);
}
