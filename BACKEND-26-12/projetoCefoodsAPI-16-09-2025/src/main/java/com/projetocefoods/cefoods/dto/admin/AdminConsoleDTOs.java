package com.projetocefoods.cefoods.dto.admin;

import java.util.List;

public class AdminConsoleDTOs {

    public record AdminPanelDTO(
            AdminSummaryDTO summary,
            List<AdminUsuarioDTO> usuarios,
            List<AdminLojaDTO> lojas,
            List<AdminProdutoDTO> produtos,
            List<AdminComentarioDTO> comentarios,
            List<AdminActivityDTO> atividades
    ) {}

    public record AdminSummaryDTO(
            long totalUsuarios,
            long usuariosRecentes,
            long totalLojas,
            long lojasPendentes,
            long totalProdutos,
            long produtosSemEstoque,
            long comentariosPendentes,
            double satisfacaoMedia
    ) {}

    public record AdminUsuarioDTO(
            Long id,
            String nome,
            String email,
            String perfil,
            String status,
            String ultimaAtividade,
            long pedidosTotal,
            List<String> lojas
    ) {}

    public record AdminLojaDTO(
            Long id,
            String nome,
            String categoria,
            String responsavel,
            String status,
            String statusAdm,
            long pedidosHoje,
            double avaliacaoMedia,
            double faturamentoMes,
            String cidade,
            String criadoEm
    ) {}

    public record AdminProdutoDTO(
            Long id,
            String nome,
            String loja,
            String categoria,
            int estoque,
            double preco,
            String status,
            String atualizadoEm,
            boolean destaque,
            Long lojaId,
            String descricao,
            String imagem
    ) {}

    public record AdminComentarioDTO(
            Long id,
            String usuario,
            String loja,
            String produto,
            String status,
            double nota,
            String mensagem,
            String criadoEm,
            String canal,
            List<String> tags
    ) {}

    public record AdminActivityDTO(
            Long id,
            String area,
            String mensagem,
            String timestamp,
            String severity
    ) {}
}
