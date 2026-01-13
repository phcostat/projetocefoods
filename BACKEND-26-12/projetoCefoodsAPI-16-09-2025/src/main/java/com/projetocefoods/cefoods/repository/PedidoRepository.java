/*package com.projetocefoods.cefoods.repository;

import com.projetocefoods.cefoods.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {}*/

package com.projetocefoods.cefoods.repository;

import com.projetocefoods.cefoods.model.Pedido;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    List<Pedido> findByUsuarioIdUsuario(Long idUsuario);

    List<Pedido> findByLojaIdLoja(Long idLoja);

    @EntityGraph(attributePaths = {"itens", "itens.produto"})
    List<Pedido> findByLojaIdLojaAndDataPedidoBetween(Long idLoja, LocalDateTime dataInicio, LocalDateTime dataFim);

}
