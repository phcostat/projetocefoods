package com.projetocefoods.cefoods.repository;

import com.projetocefoods.cefoods.model.Loja;
import com.projetocefoods.cefoods.model.StatusAdministrativoLoja;
import com.projetocefoods.cefoods.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LojaRepository extends JpaRepository<Loja, Long> {
    List<Loja> findByUsuario(Usuario usuario);

    Optional<Loja> findFirstByUsuarioIdUsuario(Long idUsuario);

    List<Loja> findByStatusAdm(StatusAdministrativoLoja statusAdm);
}
