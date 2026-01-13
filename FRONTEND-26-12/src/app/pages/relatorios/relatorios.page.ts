import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ToastController, LoadingController } from '@ionic/angular';
import { SegmentValue } from '@ionic/core';

import { AuthService } from 'src/app/services/auth.service';
import { LojaService, Loja } from 'src/app/services/loja.service';
import { RelatorioService, Relatorio, TipoPeriodo, CriarRelatorioPayload } from 'src/app/services/relatorio.service';
import { FinanceiroRelatorioBridgeService, FinanceiroSnapshot } from 'src/app/services/financeiro-relatorio-bridge.service';
import { Usuario } from 'src/app/model/usuario';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-relatorios',
  templateUrl: './relatorios.page.html',
  styleUrls: ['./relatorios.page.scss'],
  standalone: false
})
export class RelatoriosPage implements OnInit {
  usuario?: Usuario | null;
  loja?: Loja;
  relatorios: Relatorio[] = [];
  snapshot?: FinanceiroSnapshot | null;

  tipoPeriodo: TipoPeriodo = 'SEMANAL';
  dataInicio = this.toIsoDate(this.subtrairDias(6));
  dataFim = this.toIsoDate(new Date());

  carregandoLista = false;
  gerando = false;

  constructor(
    private authService: AuthService,
    private lojaService: LojaService,
    private relatorioService: RelatorioService,
    private financeiroBridge: FinanceiroRelatorioBridgeService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private location: Location,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.resolverContexto();
  }

  get snapshotDesatualizado(): boolean {
    if (!this.snapshot?.atualizadoEm) {
      return true;
    }
    const atualizado = new Date(this.snapshot.atualizadoEm).getTime();
    const diffHoras = (Date.now() - atualizado) / (1000 * 60 * 60);
    return diffHoras > 6;
  }

  get podeGerar(): boolean {
    return Boolean(this.loja?.idLoja && this.snapshot && this.dataInicio && this.dataFim && !this.gerando);
  }

  get periodoLabel(): string {
    return this.tipoPeriodo === 'SEMANAL' ? 'Últimos 7 dias' : 'Últimos 30 dias';
  }

  async atualizarTipoPeriodo(rawTipo?: SegmentValue | null | undefined) {
    const tipo: TipoPeriodo = rawTipo === 'MENSAL' ? 'MENSAL' : 'SEMANAL';
    this.tipoPeriodo = tipo;
    if (tipo === 'SEMANAL') {
      this.dataInicio = this.toIsoDate(this.subtrairDias(6));
    } else {
      this.dataInicio = this.toIsoDate(this.subtrairDias(29));
    }
    this.dataFim = this.toIsoDate(new Date());
  }

  async gerarRelatorio() {
    if (!this.loja?.idLoja || !this.snapshot) {
      await this.presentToast('Abra a página Financeiro para atualizar os dados antes de gerar o relatório.');
      return;
    }

    const payload: CriarRelatorioPayload = {
      idLoja: this.loja.idLoja,
      tipoPeriodo: this.tipoPeriodo,
      dataInicio: this.dataInicio,
      dataFim: this.dataFim,
      resumoFinanceiro: this.snapshot
    };

    this.gerando = true;
    const loader = await this.loadingCtrl.create({ message: 'Gerando PDF...' });
    await loader.present();

    try {
      const novo = await firstValueFrom(this.relatorioService.criar(payload));
      this.relatorios = [novo, ...this.relatorios];
      await this.presentToast('Relatório gerado com sucesso.');
    } catch (error) {
      console.error('Erro ao gerar relatório', error);
      await this.presentToast('Não foi possível gerar o relatório. Tente novamente.');
    } finally {
      this.gerando = false;
      loader.dismiss();
    }
  }

  voltar() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/financeiro']);
    }
  }

  async baixarRelatorio(relatorio: Relatorio) {
    try {
      const blob = await firstValueFrom(this.relatorioService.download(relatorio.idRelatorio));
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = this.montarNomeArquivo(relatorio);
      link.click();
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Erro ao baixar relatório', error);
      await this.presentToast('Falha ao baixar o PDF.');
    }
  }

  trackByRelatorio(_: number, relatorio: Relatorio) {
    return relatorio.idRelatorio;
  }

  private async resolverContexto() {
    this.usuario = this.authService.getUsuarioLogado();
    if (!this.usuario?.idUsuario) {
      await this.presentToast('Faça login novamente para acessar seus relatórios.');
      return;
    }

    try {
      this.loja = await firstValueFrom(this.lojaService.getByUsuario(this.usuario.idUsuario));
    } catch (error) {
      console.error('Erro ao buscar loja do usuário', error);
    }

    if (!this.loja) {
      await this.presentToast('Você ainda não possui uma loja cadastrada.');
      return;
    }

    this.snapshot = this.financeiroBridge.getSnapshot(this.loja.idLoja);
    await this.carregarRelatorios();
  }

  private async carregarRelatorios() {
    if (!this.loja?.idLoja) {
      return;
    }
    this.carregandoLista = true;
    try {
      this.relatorios = await firstValueFrom(this.relatorioService.listarPorLoja(this.loja.idLoja));
    } catch (error) {
      console.error('Erro ao listar relatórios', error);
    } finally {
      this.carregandoLista = false;
    }
  }

  private montarNomeArquivo(relatorio: Relatorio): string {
    const inicio = relatorio.dataInicio ? relatorio.dataInicio.replace(/-/g, '') : '';
    const fim = relatorio.dataFim ? relatorio.dataFim.replace(/-/g, '') : '';
    return `relatorio-${relatorio.tipoPeriodo.toLowerCase()}-${inicio}-${fim}.pdf`;
  }

  private subtrairDias(dias: number): Date {
    const data = new Date();
    data.setDate(data.getDate() - dias);
    return data;
  }

  private toIsoDate(date: Date): string {
    return date.toISOString().substring(0, 10);
  }

  private async presentToast(message: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2500, position: 'bottom' });
    await toast.present();
  }
}
