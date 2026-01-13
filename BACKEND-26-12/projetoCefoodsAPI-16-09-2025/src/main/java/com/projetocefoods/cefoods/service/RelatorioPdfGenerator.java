package com.projetocefoods.cefoods.service;

import com.projetocefoods.cefoods.dto.RelatorioDTO;
import com.projetocefoods.cefoods.model.PeriodoRelatorio;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.util.Matrix;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class RelatorioPdfGenerator {

    private static final float MARGIN_LEFT = 50f;
    private static final float HEADER_HEIGHT = 120f;
    private static final float SECTION_SPACING = 24f;
    private static final float FOOTER_MARGIN = 80f;
    private static final DateTimeFormatter DATA_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final PDType1Font FONT_BOLD = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
    private static final PDType1Font FONT_REGULAR = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
    private static final Color COLOR_PRIMARY = new Color(255, 111, 0);
    private static final Color COLOR_SECONDARY = new Color(29, 37, 55);
    private static final Color COLOR_MUTED = new Color(120, 128, 143);
    private static final Color COLOR_CARD = new Color(248, 249, 252);
    private static final Color COLOR_ROW_ALT = new Color(243, 245, 249);
    private static final Color COLOR_BORDER = new Color(217, 224, 234);
    private static final Color COLOR_WATERMARK = new Color(238, 240, 244);

    public byte[] gerar(RelatorioPdfContext contexto) {
        try (PDDocument document = new PDDocument()) {
            PageContext page = new PageContext(document, contexto);

            desenharCartaoLoja(page, contexto);
            desenharResumoFinanceiro(page, contexto.resumo());
            desenharTopProdutos(page, contexto.resumo());
            desenharReceitaDiaria(page, contexto.resumo());

            page.finalizar();

            try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
                document.save(outputStream);
                return outputStream.toByteArray();
            }
        } catch (IOException ex) {
            throw new IllegalStateException("Erro ao gerar PDF de relatorio", ex);
        }
    }

    private void desenharCartaoLoja(PageContext page, RelatorioPdfContext contexto) throws IOException {
        float largura = page.larguraUtil();
        float altura = calcularAlturaPerfil(contexto, largura);
        page.ensureSpace(altura + SECTION_SPACING);

        float topo = page.cursorY;
        float bottom = topo - altura;
        desenharRetangulo(page.stream, MARGIN_LEFT, bottom, largura, altura, COLOR_CARD);
        desenharBorda(page.stream, MARGIN_LEFT, bottom, largura, altura);

        escreverTexto(page.stream, MARGIN_LEFT + 18f, topo - 24f, FONT_BOLD, 14f, COLOR_SECONDARY, "Perfil da operação");
        escreverTexto(page.stream, MARGIN_LEFT + 18f, topo - 42f, FONT_REGULAR, 11f, COLOR_MUTED,
                "Dados oficiais da loja e do responsável legal");

        float linhaY = topo - 62f;
        linhaY = escreverInformacaoDupla(page.stream, linhaY, largura, "Loja", contexto.lojaNome(), "Responsável", contexto.responsavelNome());
        linhaY = escreverInformacaoDupla(page.stream, linhaY, largura, "Documento", contexto.responsavelDocumento(), "Contato", contexto.responsavelContato());
        linhaY = escreverInformacaoDupla(page.stream, linhaY, largura, "Endereço", contexto.lojaEndereco(), "Canais", contexto.lojaContato());

        float descricaoX = MARGIN_LEFT + 18f;
        float descricaoLargura = largura - 36f;
        float descricaoAltura = calcularAlturaTexto(contexto.lojaDescricao(), descricaoLargura, FONT_REGULAR, 10f);
        float descricaoInicio = bottom + 18f + descricaoAltura;
        escreverTextoQuebrado(page.stream, descricaoX, descricaoInicio, descricaoLargura,
            contexto.lojaDescricao(), FONT_REGULAR, 10f, COLOR_MUTED);

        page.cursorY = bottom - SECTION_SPACING;
    }

    private void desenharResumoFinanceiro(PageContext page, RelatorioDTO.FinanceiroSnapshot resumo) throws IOException {
        if (resumo == null) {
            return;
        }
        float largura = page.larguraUtil();
        int colunas = 3;
        float cardWidth = (largura - (colunas - 1) * 12f) / colunas;
        float cardHeight = 60f;
        String[][] metricas = new String[][]{
                {"Receita total", "R$ " + formatar(resumo.receitaTotal())},
                {"Ticket médio", "R$ " + formatar(resumo.ticketMedio())},
                {"Pedidos recebidos", String.valueOf(safeInt(resumo.pedidosRecebidos()))},
                {"Pedidos aceitos", String.valueOf(safeInt(resumo.pedidosAceitos()))},
                {"Pedidos recusados", String.valueOf(safeInt(resumo.pedidosRecusados()))},
                {"Itens vendidos", String.valueOf(safeInt(resumo.itensVendidos()))},
                {"Taxa de conversão", formatar(resumo.taxaConversao()) + "%"}
        };
        int linhas = (int) Math.ceil(metricas.length / (double) colunas);
        float alturaNecessaria = 50f + linhas * (cardHeight + 12f);
        page.ensureSpace(alturaNecessaria);

        escreverTexto(page.stream, MARGIN_LEFT, page.cursorY, FONT_BOLD, 13f, COLOR_SECONDARY, "Resumo financeiro");
        desenharLinhaDivisoria(page.stream, page.cursorY - 6f, largura);
        float topoGrid = page.cursorY - 20f;

        for (int i = 0; i < metricas.length; i++) {
            int coluna = i % colunas;
            int linha = i / colunas;
            float cardX = MARGIN_LEFT + coluna * (cardWidth + 12f);
            float cardTop = topoGrid - linha * (cardHeight + 12f);
            desenharRetangulo(page.stream, cardX, cardTop - cardHeight, cardWidth, cardHeight, Color.WHITE);
            desenharBorda(page.stream, cardX, cardTop - cardHeight, cardWidth, cardHeight);
            escreverTexto(page.stream, cardX + 12f, cardTop - 18f, FONT_REGULAR, 10f, COLOR_MUTED, metricas[i][0]);
            escreverTexto(page.stream, cardX + 12f, cardTop - 36f, FONT_BOLD, 14f, COLOR_SECONDARY, metricas[i][1]);
        }

        float novaPosicao = topoGrid - linhas * (cardHeight + 12f);
        page.cursorY = novaPosicao - SECTION_SPACING;
    }

    private void desenharTopProdutos(PageContext page, RelatorioDTO.FinanceiroSnapshot resumo) throws IOException {
        if (resumo == null || resumo.topProdutos() == null || resumo.topProdutos().isEmpty()) {
            return;
        }

        List<RelatorioDTO.TopProduto> produtos = resumo.topProdutos();
        int index = 0;
        float largura = page.larguraUtil();
        float headerHeight = 28f;
        float rowHeight = 26f;
        float produtoColX = MARGIN_LEFT + 14f;
        float qtdColRight = MARGIN_LEFT + (largura * 0.78f);
        float valorColRight = MARGIN_LEFT + largura - 14f;

        outer:
        while (index < produtos.size()) {
            if (page.ensureSpace(headerHeight + rowHeight + 40f)) {
                continue;
            }

            escreverTexto(page.stream, MARGIN_LEFT, page.cursorY, FONT_BOLD, 13f, COLOR_SECONDARY,
                    index == 0 ? "Top produtos" : "Top produtos (cont.)");
            desenharLinhaDivisoria(page.stream, page.cursorY - 6f, largura);
            page.cursorY -= 20f;

            desenharRetangulo(page.stream, MARGIN_LEFT, page.cursorY - headerHeight, largura, headerHeight, COLOR_SECONDARY);
            escreverTexto(page.stream, produtoColX, page.cursorY - 18f, FONT_BOLD, 11f, Color.WHITE, "Produto");
            escreverTextoDireita(page.stream, qtdColRight, page.cursorY - 18f, FONT_BOLD, 11f, Color.WHITE, "Qtd.");
            escreverTextoDireita(page.stream, valorColRight, page.cursorY - 18f, FONT_BOLD, 11f, Color.WHITE, "Total");
            page.cursorY -= headerHeight;

            while (index < produtos.size()) {
                if (page.ensureSpace(rowHeight + 6f)) {
                    continue outer;
                }
                RelatorioDTO.TopProduto produto = produtos.get(index);
                Color fundo = (index % 2 == 0) ? Color.WHITE : COLOR_ROW_ALT;
                desenharRetangulo(page.stream, MARGIN_LEFT, page.cursorY - rowHeight, largura, rowHeight, fundo);
                desenharBorda(page.stream, MARGIN_LEFT, page.cursorY - rowHeight, largura, rowHeight);
                escreverTexto(page.stream, produtoColX, page.cursorY - 17f, FONT_REGULAR, 11f, COLOR_SECONDARY,
                        truncar(produto.nome(), 52));
                escreverTextoDireita(page.stream, qtdColRight, page.cursorY - 17f, FONT_BOLD, 11f, COLOR_SECONDARY,
                        String.valueOf(safeInt(produto.quantidade())));
                escreverTextoDireita(page.stream, valorColRight, page.cursorY - 17f, FONT_BOLD, 11f, COLOR_SECONDARY,
                        "R$ " + formatar(produto.total()));
                page.cursorY -= rowHeight;
                index++;
            }

            page.cursorY -= SECTION_SPACING;
        }
    }

    private void desenharReceitaDiaria(PageContext page, RelatorioDTO.FinanceiroSnapshot resumo) throws IOException {
        if (resumo == null || resumo.receitaDiaria() == null || resumo.receitaDiaria().isEmpty()) {
            return;
        }

        List<RelatorioDTO.ReceitaDiaria> dias = resumo.receitaDiaria();
        int index = 0;
        float largura = page.larguraUtil();
        float headerHeight = 26f;
        float rowHeight = 24f;
        float diaColX = MARGIN_LEFT + 14f;
        float valorColRight = MARGIN_LEFT + largura - 14f;

        outer:
        while (index < dias.size()) {
            if (page.ensureSpace(headerHeight + rowHeight + 40f)) {
                continue;
            }

            escreverTexto(page.stream, MARGIN_LEFT, page.cursorY, FONT_BOLD, 13f, COLOR_SECONDARY,
                    index == 0 ? "Receita diaria" : "Receita diaria (cont.)");
            desenharLinhaDivisoria(page.stream, page.cursorY - 6f, largura);
            page.cursorY -= 20f;

            desenharRetangulo(page.stream, MARGIN_LEFT, page.cursorY - headerHeight, largura, headerHeight, COLOR_PRIMARY);
            escreverTexto(page.stream, diaColX, page.cursorY - 17f, FONT_BOLD, 11f, Color.WHITE, "Dia");
            escreverTextoDireita(page.stream, valorColRight, page.cursorY - 17f, FONT_BOLD, 11f, Color.WHITE, "Receita");
            page.cursorY -= headerHeight;

            while (index < dias.size()) {
                if (page.ensureSpace(rowHeight + 6f)) {
                    continue outer;
                }
                RelatorioDTO.ReceitaDiaria dia = dias.get(index);
                Color fundo = (index % 2 == 0) ? Color.WHITE : COLOR_ROW_ALT;
                desenharRetangulo(page.stream, MARGIN_LEFT, page.cursorY - rowHeight, largura, rowHeight, fundo);
                desenharBorda(page.stream, MARGIN_LEFT, page.cursorY - rowHeight, largura, rowHeight);
                escreverTexto(page.stream, diaColX, page.cursorY - 16f, FONT_REGULAR, 11f, COLOR_SECONDARY,
                        truncar(dia.label() + " (" + dia.iso() + ")", 56));
                escreverTextoDireita(page.stream, valorColRight, page.cursorY - 16f, FONT_BOLD, 11f, COLOR_SECONDARY,
                        "R$ " + formatar(dia.total()));
                page.cursorY -= rowHeight;
                index++;
            }

            page.cursorY -= SECTION_SPACING;
        }
    }

    // === helpers reused from versao anterior (escreverTexto, truncar etc.) ===
    private void desenharFaixaSuperior(PDPageContentStream stream, PDRectangle mediaBox, RelatorioPdfContext contexto) throws IOException {
        float topo = mediaBox.getHeight();
        float base = topo - HEADER_HEIGHT;
        desenharRetangulo(stream, 0, base, mediaBox.getWidth(), HEADER_HEIGHT, COLOR_SECONDARY);
        float destaqueLargura = 220f;
        desenharRetangulo(stream, 0, base, destaqueLargura, HEADER_HEIGHT, COLOR_PRIMARY);
        escreverTexto(stream, 32f, topo - 42f, FONT_BOLD, 26f, Color.WHITE, "Cefoods");
        escreverTexto(stream, 32f, topo - 62f, FONT_REGULAR, 11f, Color.WHITE, "Inteligência financeira e performance");
        float infoX = destaqueLargura + 30f;
        float linhaPrincipalY = topo - 36f;
        escreverTexto(stream, infoX, linhaPrincipalY, FONT_BOLD, 16f, Color.WHITE,
                "Relatório " + formatarPeriodo(contexto.tipoPeriodo()));
        escreverTexto(stream, infoX, linhaPrincipalY - 16f, FONT_REGULAR, 11f, Color.WHITE,
                textoSeguro(contexto.lojaNome()));
        escreverTexto(stream, infoX, linhaPrincipalY - 32f, FONT_REGULAR, 11f, Color.WHITE,
                "Período: " + range(contexto.dataInicio(), contexto.dataFim()));
        float rightX = mediaBox.getWidth() - 32f;
        escreverTextoDireita(stream, rightX, topo - 38f, FONT_REGULAR, 11f, Color.WHITE,
                "Emitido em: " + DATA_FORMATTER.format(LocalDate.now()));
        escreverTextoDireita(stream, rightX, topo - 56f, FONT_REGULAR, 10f, Color.WHITE,
                textoSeguro(contexto.lojaContato()));
    }

    private void desenharMarcaDagua(PDPageContentStream stream, PDRectangle mediaBox) throws IOException {
        stream.saveGraphicsState();
        stream.setNonStrokingColor(COLOR_WATERMARK);
        stream.beginText();
        stream.setFont(FONT_BOLD, 70f);
        stream.setTextMatrix(Matrix.getRotateInstance(Math.toRadians(45), mediaBox.getWidth() / 4, mediaBox.getHeight() / 2));
        stream.showText("CEFOODS");
        stream.endText();
        stream.restoreGraphicsState();
    }

    private void desenharRodape(PDPageContentStream stream, PDRectangle mediaBox) throws IOException {
        escreverTexto(stream, MARGIN_LEFT, 40f, FONT_REGULAR, 9f, COLOR_MUTED,
                "Documento gerado automaticamente pelo CEFOODS. Válido apenas para fins internos.");
        escreverTextoDireita(stream, mediaBox.getWidth() - 50f, 40f, FONT_REGULAR, 9f, COLOR_MUTED,
                "confidencial • " + DATA_FORMATTER.format(LocalDate.now()));
    }

    private float escreverInformacaoDupla(PDPageContentStream stream, float linhaY, float largura, String labelEsq, String valorEsq,
                                          String labelDir, String valorDir) throws IOException {
        float colunaOffset = largura / 2f;
        float larguraUtil = colunaOffset - 36f;
        float yEsquerda = escreverLabelValor(stream, MARGIN_LEFT + 18f, linhaY, larguraUtil, labelEsq, valorEsq);
        float yDireita = escreverLabelValor(stream, MARGIN_LEFT + 18f + colunaOffset, linhaY, larguraUtil, labelDir, valorDir);
        return Math.min(yEsquerda, yDireita) - 6f;
    }

    private float escreverLabelValor(PDPageContentStream stream, float x, float y, float larguraDisponivel, String label, String valor) throws IOException {
        escreverTexto(stream, x, y, FONT_REGULAR, 9f, COLOR_MUTED, label);
        float inicioValorY = y - 12f;
        return escreverTextoQuebrado(stream, x, inicioValorY, larguraDisponivel, textoSeguro(valor), FONT_BOLD, 11f, COLOR_SECONDARY);
    }

    private void desenharRetangulo(PDPageContentStream stream, float x, float y, float largura, float altura, Color cor) throws IOException {
        stream.setNonStrokingColor(cor);
        stream.addRect(x, y, largura, altura);
        stream.fill();
    }

    private void desenharBorda(PDPageContentStream stream, float x, float y, float largura, float altura) throws IOException {
        stream.setStrokingColor(COLOR_BORDER);
        stream.setLineWidth(0.6f);
        stream.addRect(x, y, largura, altura);
        stream.stroke();
    }

    private void desenharLinhaDivisoria(PDPageContentStream stream, float y, float largura) throws IOException {
        stream.setStrokingColor(COLOR_BORDER);
        stream.setLineWidth(0.6f);
        stream.moveTo(MARGIN_LEFT, y);
        stream.lineTo(MARGIN_LEFT + largura, y);
        stream.stroke();
    }

    private void escreverTexto(PDPageContentStream stream, float x, float y, PDType1Font fonte, float tamanho, Color cor, String texto) throws IOException {
        String conteudo = texto == null ? "" : texto;
        stream.beginText();
        stream.setFont(fonte, tamanho);
        stream.setNonStrokingColor(cor);
        stream.newLineAtOffset(x, y);
        stream.showText(conteudo);
        stream.endText();
    }

    private void escreverTextoDireita(PDPageContentStream stream, float xFinal, float y, PDType1Font fonte, float tamanho, Color cor, String texto) throws IOException {
        String conteudo = texto == null ? "" : texto;
        float larguraTexto = medirTexto(fonte, tamanho, conteudo);
        escreverTexto(stream, xFinal - larguraTexto, y, fonte, tamanho, cor, conteudo);
    }

    private float escreverTextoQuebrado(PDPageContentStream stream, float x, float y, float larguraMax, String texto,
                                        PDType1Font fonte, float tamanho, Color cor) throws IOException {
        String conteudo = texto == null ? "" : texto;
        if (conteudo.isBlank() || larguraMax <= 0) {
            escreverTexto(stream, x, y, fonte, tamanho, cor, conteudo);
            return y - (tamanho + 2f);
        }

        float linhaY = y;
        for (String linha : quebrarEmLinhas(conteudo, fonte, tamanho, larguraMax)) {
            escreverTexto(stream, x, linhaY, fonte, tamanho, cor, linha);
            linhaY -= tamanho + 2f;
        }
        return linhaY;
    }

    private List<String> quebrarEmLinhas(String texto, PDType1Font fonte, float tamanho, float larguraMax) throws IOException {
        List<String> linhas = new ArrayList<>();
        if (texto == null || texto.isBlank()) {
            return linhas;
        }

        String[] palavras = texto.trim().split("\\s+");
        StringBuilder linhaAtual = new StringBuilder();
        for (String palavra : palavras) {
            String tentativa = linhaAtual.length() == 0 ? palavra : linhaAtual + " " + palavra;
            if (medirTexto(fonte, tamanho, tentativa) <= larguraMax) {
                linhaAtual.setLength(0);
                linhaAtual.append(tentativa);
            } else {
                if (linhaAtual.length() > 0) {
                    linhas.add(linhaAtual.toString());
                }
                if (medirTexto(fonte, tamanho, palavra) > larguraMax && palavra.length() > 1) {
                    linhas.add(palavra);
                    linhaAtual.setLength(0);
                } else {
                    linhaAtual.setLength(0);
                    linhaAtual.append(palavra);
                }
            }
        }
        if (linhaAtual.length() > 0) {
            linhas.add(linhaAtual.toString());
        }
        if (linhas.isEmpty()) {
            linhas.add(texto);
        }
        return linhas;
    }

    private float medirTexto(PDType1Font fonte, float tamanho, String texto) throws IOException {
        if (texto == null || texto.isBlank()) {
            return 0f;
        }
        return fonte.getStringWidth(texto) / 1000f * tamanho;
    }

    private float calcularAlturaPerfil(RelatorioPdfContext contexto, float largura) throws IOException {
        float altura = 80f;
        float colunaLargura = largura / 2f - 36f;
        altura += medirBlocoInformacao(colunaLargura, contexto.lojaNome(), contexto.responsavelNome());
        altura += medirBlocoInformacao(colunaLargura, contexto.responsavelDocumento(), contexto.responsavelContato());
        altura += medirBlocoInformacao(colunaLargura, contexto.lojaEndereco(), contexto.lojaContato());
        altura += calcularAlturaTexto(contexto.lojaDescricao(), largura - 36f, FONT_REGULAR, 10f) + 20f;
        return Math.max(altura, 160f);
    }

    private float medirBlocoInformacao(float largura, String valorEsq, String valorDir) throws IOException {
        float esquerda = calcularAlturaTexto(valorEsq, largura, FONT_BOLD, 11f);
        float direita = calcularAlturaTexto(valorDir, largura, FONT_BOLD, 11f);
        return Math.max(esquerda, direita) + 32f;
    }

    private float calcularAlturaTexto(String texto, float larguraMax, PDType1Font fonte, float tamanho) throws IOException {
        String conteudo = textoSeguro(texto);
        if (conteudo.isBlank() || larguraMax <= 0) {
            return tamanho + 2f;
        }
        return Math.max(tamanho + 2f, quebrarEmLinhas(conteudo, fonte, tamanho, larguraMax).size() * (tamanho + 2f));
    }

    private String truncar(String texto, int limite) {
        if (texto == null || texto.length() <= limite) {
            return texto == null ? "" : texto;
        }
        return texto.substring(0, Math.max(0, limite - 1)).trim() + "...";
    }

    private String textoSeguro(String texto) {
        return (texto == null || texto.isBlank()) ? "Não informado" : texto;
    }

    private String range(LocalDate inicio, LocalDate fim) {
        return DATA_FORMATTER.format(inicio) + " - " + DATA_FORMATTER.format(fim);
    }

    private String formatarPeriodo(PeriodoRelatorio periodo) {
        if (periodo == null) {
            return "personalizado";
        }
        String nome = periodo.name().toLowerCase(Locale.ROOT);
        return Character.toUpperCase(nome.charAt(0)) + nome.substring(1);
    }

    private String formatar(Double valor) {
        if (valor == null) {
            return "0,00";
        }
        return String.format(Locale.forLanguageTag("pt-BR"), "%,.2f", valor)
                .replace(',', '#')
                .replace('.', ',')
                .replace('#', '.');
    }

    private int safeInt(Integer valor) {
        return valor == null ? 0 : valor;
    }

    private class PageContext {
        private final PDDocument document;
        private final RelatorioPdfContext contexto;
        private PDPage page;
        private PDPageContentStream stream;
        private PDRectangle mediaBox;
        private float cursorY;

        PageContext(PDDocument document, RelatorioPdfContext contexto) throws IOException {
            this.document = document;
            this.contexto = contexto;
            abrirNovaPagina();
        }

        void abrirNovaPagina() throws IOException {
            if (stream != null) {
                desenharRodape(stream, mediaBox);
                stream.close();
            }
            page = new PDPage(PDRectangle.A4);
            document.addPage(page);
            mediaBox = page.getMediaBox();
            stream = new PDPageContentStream(document, page);
            desenharMarcaDagua(stream, mediaBox);
            desenharFaixaSuperior(stream, mediaBox, contexto);
            cursorY = mediaBox.getHeight() - HEADER_HEIGHT - 30f;
        }

        boolean ensureSpace(float requiredAltura) throws IOException {
            if (cursorY - requiredAltura < FOOTER_MARGIN) {
                abrirNovaPagina();
                return true;
            }
            return false;
        }

        void finalizar() throws IOException {
            if (stream != null) {
                desenharRodape(stream, mediaBox);
                stream.close();
                stream = null;
            }
        }

        float larguraUtil() {
            return mediaBox.getWidth() - (MARGIN_LEFT * 2);
        }
    }

    public record RelatorioPdfContext(
            String lojaNome,
            String lojaDescricao,
            String lojaEndereco,
            String lojaContato,
            String responsavelNome,
            String responsavelDocumento,
            String responsavelContato,
            PeriodoRelatorio tipoPeriodo,
            LocalDate dataInicio,
            LocalDate dataFim,
            RelatorioDTO.FinanceiroSnapshot resumo
    ) {}
}
