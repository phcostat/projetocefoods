package com.projetocefoods.cefoods.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.projetocefoods.cefoods.model.StatusAdministrativoLoja;

public record LojaResponse(
    Long idLoja,
    String nomeFantasia,
    String descricao,
    String fotoCapa,
    String localizacao,
    Boolean status,
    Boolean visivel,
    Boolean aceitaPix,
    Boolean aceitaDinheiro,
    Boolean aceitaCartao,
    LocalDateTime dataCriacao,
    Integer qtdProdutosVendidos,
    Double avaliacaoMedia,
    UsuarioResponse usuario,
    Boolean manualOverride, // ✅ incluir aqui
    List<HorarioFuncionamentoDTO> horarios, // ✅ adicionar aqui
    StatusAdministrativoLoja statusAdm
) {}
