package com.projetocefoods.cefoods.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.projetocefoods.cefoods.model.Notificacao;

import java.util.List;

public interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {
    List<Notificacao> findByUsuarioDestinoIdUsuarioOrderByDataCriacaoDesc(Long idUsuario);
    List<Notificacao> findByLojaDestinoIdLojaOrderByDataCriacaoDesc(Long idLoja);
    List<Notificacao> findByUsuarioDestinoIdUsuarioAndLidaFalse(Long idUsuario);
}
