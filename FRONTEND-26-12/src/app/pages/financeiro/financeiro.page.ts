// src/app/pages/financeiro/financeiro.page.ts
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LojaService, Loja } from 'src/app/services/loja.service';
import { PedidoService, Pedido } from 'src/app/services/pedido.service';
import { ProdutoService, Produto } from 'src/app/services/produto.service';
import { Chart } from 'chart.js/auto';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { Location } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { LojaAccessService } from 'src/app/services/loja-access.service';
import { FinanceiroRelatorioBridgeService, FinanceiroSnapshot } from 'src/app/services/financeiro-relatorio-bridge.service';

@Component({
  selector: 'app-financeiro',
  templateUrl: './financeiro.page.html',
  styleUrls: ['./financeiro.page.scss'],
  standalone: false
})
export class FinanceiroPage implements OnInit, AfterViewInit {
  loja?: Loja;
  pedidos: any[] = []; // usamos any para tolerância (pode vir de API ou localStorage)
  pedidosBrutos: any[] = [];
  produtos: Produto[] = [];
  receitaDiaSeries: { iso: string; label: string; total: number }[] = [];

  receitaTotal = 0;
  receitaPorProduto: { nome: string; total: number; quant: number }[] = [];
  private chartPagamentos?: Chart;
  private chartReceitaDia?: Chart;
  private chartProdutos?: Chart;
  custoTotalInput = '';
  lucroEstimado: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private lojaService: LojaService,
    private pedidoService: PedidoService,
    private authService: AuthService,
    private produtoService: ProdutoService,
    private router: Router,
    private location: Location,
    private lojaAccessService: LojaAccessService,
    private financeiroBridge: FinanceiroRelatorioBridgeService
  ) { }

  ngOnInit() {
    const idLoja = Number(this.route.snapshot.paramMap.get('id'));
    if (!idLoja) {
      console.warn('ID da loja inválido');
      return;
    }
    this.carregarDados(idLoja);
  }

  ngAfterViewInit() {
    // garante que os canvas existam antes do primeiro render
    requestAnimationFrame(() => this.renderizarGraficos());
  }

  // --- Helpers para normalizar campos vindos do backend ou do localStorage ---
  private getPedidoLojaId(p: any): number | null {
    if (!p) return null;
    if (typeof p.idLoja === 'number') return p.idLoja;
    if (p.loja && (p.loja.idLoja || p.loja.id)) return p.loja.idLoja ?? p.loja.id;
    if (typeof p['id_loja'] === 'number') return p['id_loja'];
    return null;
  }

  private getPedidoStatusNormalized(p: any): string {
    const s = (p?.status ?? p?.statusPedido ?? '').toString();
    return s ? s.trim().toUpperCase() : '';
  }

  private getPedidoTotalValue(p: any): number {
    return Number(p?.total ?? p?.valorTotal ?? 0) || 0;
  }

  private getPedidoDate(p: any): Date {
    const raw = p?.dataPedido ?? p?.data ?? p?.dataPedido ?? p?.dataPedidoString ?? null;
    if (!raw) return new Date(0);
    const dt = new Date(raw);
    if (isNaN(dt.getTime())) {
      // tenta parse manual (caso backend envie objeto)
      return new Date();
    }
    return dt;
  }

  // ---------------------------
  // Método principal — carregamento e cálculo
  // ---------------------------
  get ticketMedio(): number {
    return this.pedidos.length ? this.receitaTotal / this.pedidos.length : 0;
  }

  get itensVendidos(): number {
    return this.receitaPorProduto.reduce((acc, prod) => acc + (prod.quant || 0), 0);
  }

  get totalPedidosRecebidos(): number {
    return this.pedidosBrutos.length;
  }

  get pedidosAceitos(): number {
    return this.pedidosBrutos.filter(p => {
      const status = this.getPedidoStatusNormalized(p);
      return [
        'ACCEPTED',
        'ACEITO',
        'COMPLETED',
        'CONCLUDED',
        'FINALIZED',
        'FINALIZADO',
        'CONCLUIDO'
      ].includes(status);
    }).length;
  }

  get pedidosRecusados(): number {
    return this.pedidosBrutos.filter(p => {
      const status = this.getPedidoStatusNormalized(p);
      return ['RECUSADO', 'CANCELLED', 'DECLINED'].includes(status);
    }).length;
  }

  get taxaConversao(): number {
    return this.totalPedidosRecebidos ? (this.pedidos.length / this.totalPedidosRecebidos) * 100 : 0;
  }

  async carregarDados(idLoja: number) {
    try {
      this.loja = await firstValueFrom(this.lojaService.getById(idLoja));
    } catch (error) {
      console.error('Erro ao carregar loja:', error);
      this.loja = undefined;
    }

    // 🔹 produtos da loja
    try {
      const all = await firstValueFrom(this.produtoService.getAll());
      const arr = Array.isArray(all) ? all : [];
      this.produtos = arr.filter((p: any) => {
        const pidLoja = p.idLoja ?? p.lojaId ?? p.id_loja ?? p.loja?.idLoja;
        return Number(pidLoja) === idLoja;
      });
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      this.produtos = [];
    }

    // 🔹 pedidos da loja concluídos
    try {
      const pedidos = await firstValueFrom(this.pedidoService.getPedidosPorLoja(idLoja));
      this.pedidosBrutos = Array.isArray(pedidos) ? pedidos : [];
      this.pedidos = this.pedidosBrutos.filter(p => {
        const status = (p.status ?? '').toUpperCase();
        return ['COMPLETED', 'CONCLUDED', 'FINALIZED'].includes(status);
      });
    } catch (err) {
      console.error('Erro ao carregar pedidos da loja:', err);
      this.pedidosBrutos = [];
      this.pedidos = [];
    }

    // 🔹 receita total
    this.receitaTotal = this.pedidos.reduce((acc, p) => acc + this.getPedidoTotalValue(p), 0);

    // 🔹 receita por produto
    const mapa: Record<string, { total: number; quant: number }> = {};
    this.pedidos.forEach(p => {
      (p.itens || []).forEach((item: any) => {
        const nome = item?.nomeProduto ?? item?.nome ?? item?.produto?.nome ?? 'Produto';
        const quant = Number(item?.quantidade ?? item?.quant ?? 0) || 1;
        const subtotal = Number(item?.subtotal ?? item?.valor ?? 0);
        const precoUnit = Number(item?.precoUnitario ?? item?.preco ?? 0);
        const totalLinha = subtotal || precoUnit * quant;

        if (!mapa[nome]) mapa[nome] = { total: 0, quant: 0 };
        mapa[nome].total += totalLinha;
        mapa[nome].quant += quant;
      });
    });

    this.receitaPorProduto = Object.entries(mapa)
      .map(([nome, v]) => ({ nome, total: v.total, quant: v.quant }))
      .sort((a, b) => b.total - a.total);

    this.processarReceitaDiaria();
    this.publicarSnapshot();

    // 🔹 renderiza gráficos após atualização
    requestAnimationFrame(() => this.renderizarGraficos());
  }

  calcularLucro() {
    const gasto = Number(this.custoTotalInput);
    if (isNaN(gasto)) {
      this.lucroEstimado = null;
      return;
    }
    this.lucroEstimado = this.receitaTotal - gasto;
  }


  // ---------------------------
  // Gráficos (usam os dados normalizados acima)
  // ---------------------------
  renderizarGraficos() {
    this.graficoFormasPagamento();
    this.graficoReceitaPorDia();
    this.graficoProdutosMaisVendidos();
  }

  graficoFormasPagamento() {
    const ctx = document.getElementById('graficoPagamentos') as HTMLCanvasElement;
    if (!ctx) return;

    const pagamentos: Record<string, number> = { Pix: 0, Dinheiro: 0, Cartão: 0 };
    this.pedidos.forEach((p: any) => {
      const valor = this.getPedidoTotalValue(p);
      const fp = (p.formaPagamento ?? p.forma ?? '').toString().toUpperCase();
      if (fp.includes('PIX')) pagamentos['Pix'] += valor;
      else if (fp.includes('DINHEIRO')) pagamentos['Dinheiro'] += valor;
      else pagamentos['Cartão'] += valor;
    });

    this.chartPagamentos?.destroy();
    this.chartPagamentos = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(pagamentos),
        datasets: [{
          data: Object.values(pagamentos),
          // cores são opcionais; mantive para visual
          backgroundColor: ['#38b000', '#f48c06', '#4361ee']
        }]
      }
    });
  }

  graficoReceitaPorDia() {
    const ctx = document.getElementById('graficoReceitaDia') as HTMLCanvasElement;
    if (!ctx) return;
    if (!this.receitaDiaSeries.length) {
      this.processarReceitaDiaria();
    }

    const labels = this.receitaDiaSeries.map(item => item.label);
    const valores = this.receitaDiaSeries.map(item => Number(item.total.toFixed(2)));

    this.chartReceitaDia?.destroy();
    this.chartReceitaDia = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Receita por dia',
          data: valores,
          backgroundColor: '#e63946'
        }]
      }
    });
  }

  graficoProdutosMaisVendidos() {
    const ctx = document.getElementById('graficoProdutos') as HTMLCanvasElement;
    if (!ctx) return;

    const labels = this.receitaPorProduto.length
      ? this.receitaPorProduto.map(p => p.nome)
      : ['Sem dados'];
    const valores = this.receitaPorProduto.length
      ? this.receitaPorProduto.map(p => Number(p.total.toFixed(2)))
      : [0];

    this.chartProdutos?.destroy();
    this.chartProdutos = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Receita por produto',
          data: valores,
          backgroundColor: '#0077b6'
        }]
      }
    });
  }

  // ---------------------------
  // Navegação / UI helpers
  // ---------------------------
  async abrirLojaIcon() {
    await this.lojaAccessService.abrirMinhaLojaOuPerguntar();
  }

  irPesquisa() { this.router.navigate(['/pesquisa']); }
  irPerfil() { this.router.navigate(['/perfil']); }
  irCarrinho() { this.router.navigate(['/carrinho']); }

  irRelatorios() {
    if (this.loja?.idLoja) {
      this.router.navigate(['/relatorios'], {
        queryParams: { idLoja: this.loja.idLoja }
      });
    } else {
      this.router.navigate(['/relatorios']);
    }
  }

  voltar() {
    if (window.history.length > 1) this.location.back();
    else this.router.navigate(['/inicio']);
  }

  private processarReceitaDiaria() {
    const mapaDias = new Map<string, { label: string; total: number }>();
    this.pedidos.forEach(p => {
      const data = this.getPedidoDate(p);
      if (isNaN(data.getTime())) {
        return;
      }
      const iso = data.toISOString().substring(0, 10);
      const label = data.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
      const atual = mapaDias.get(iso);
      const valor = this.getPedidoTotalValue(p);
      if (atual) atual.total += valor;
      else mapaDias.set(iso, { label, total: valor });
    });

    this.receitaDiaSeries = Array.from(mapaDias.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([iso, info]) => ({ iso, label: info.label, total: info.total }));
  }

  private publicarSnapshot() {
    if (!this.loja?.idLoja) {
      return;
    }

    const periodoReferencia = this.receitaDiaSeries.length
      ? {
          inicio: this.receitaDiaSeries[0].iso,
          fim: this.receitaDiaSeries[this.receitaDiaSeries.length - 1].iso
        }
      : undefined;

    const snapshot: FinanceiroSnapshot = {
      lojaId: this.loja.idLoja,
      lojaNome: this.loja.nomeFantasia,
      receitaTotal: this.receitaTotal,
      ticketMedio: Number(this.ticketMedio.toFixed(2)),
      pedidosRecebidos: this.totalPedidosRecebidos,
      pedidosAceitos: this.pedidosAceitos,
      pedidosRecusados: this.pedidosRecusados,
      itensVendidos: this.itensVendidos,
      taxaConversao: Number(this.taxaConversao.toFixed(2)),
      atualizadoEm: new Date().toISOString(),
      periodoReferencia,
      topProdutos: this.receitaPorProduto.slice(0, 5).map(prod => ({
        nome: prod.nome,
        total: Number(prod.total.toFixed(2)),
        quantidade: prod.quant || 0
      })),
      receitaDiaria: this.receitaDiaSeries.map(item => ({
        iso: item.iso,
        label: item.label,
        total: Number(item.total.toFixed(2))
      }))
    };

    this.financeiroBridge.setSnapshot(snapshot);
  }
}
