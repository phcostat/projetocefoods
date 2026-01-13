package com.projetocefoods.cefoods.repository;

import com.projetocefoods.cefoods.model.Carrinho;
import com.projetocefoods.cefoods.model.Loja;
import com.projetocefoods.cefoods.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CarrinhoRepository extends JpaRepository<Carrinho, Long> {
    Optional<Carrinho> findByUsuario(Usuario usuario);
    Optional<Carrinho> findByUsuarioAndLoja(Usuario usuario, Loja loja);
    void deleteByUsuario(Usuario usuario);
}
