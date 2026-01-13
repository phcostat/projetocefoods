/*import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProdutoService, Produto } from 'src/app/services/produto.service';
import { LojaService, Loja } from 'src/app/services/loja.service';
import { AuthService } from 'src/app/services/auth.service'; //antes Usuario era importado aqui
import { Usuario } from 'src/app/model/usuario'; //essa linha nao existia
import { AlertController, NavController } from '@ionic/angular';
import { LojaAccessService } from 'src/app/services/loja-access.service';

interface ProdutoCardVM {
  produto: Produto & { lojaFechada?: boolean };
  nomeLoja: string;
  mediaAvaliacao: number;      // 0..5 com 1 casa
  mediaAvaliacaoInt: number;   // arredondado p/ preencher estrelas
}

@Component({
  selector: 'app-pesquisa',
  templateUrl: './pesquisa.page.html',
  styleUrls: ['./pesquisa.page.scss'],
  standalone: false
})
export class PesquisaPage implements OnInit {

  termoPesquisa = '';
  produtosDisponiveis: Produto[] = [];
  lojas: Loja[] = [];
  produtosFiltrados: ProdutoCardVM[] = [];
  usuarioLogado?: Usuario | null;

  private readonly STORAGE_AVALIACOES = 'cefoods_avaliacoes';

  constructor(
    private produtoService: ProdutoService,
    private lojaService: LojaService,
    private authService: AuthService,
    private router: Router,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private lojaAccessService: LojaAccessService
  ) { }

  ngOnInit() {
    this.usuarioLogado = this.authService.getUsuarioLogado();

    // somente produtos disponíveis
    this.produtosDisponiveis = this.produtoService.getAll().filter(p => p.disponivel);

    // carregar lojas da API corretamente
    this.lojaService.getAll().subscribe({
      next: lojas => {
        this.lojas = lojas.filter(loja => loja.statusAdm === 'ATIVA');
      },
      error: err => {
        console.error('Erro ao carregar lojas para pesquisa:', err);
        this.lojas = [];
      }
    });
  }


  // ==== BUSCA ====
  buscar() {
    const termo = (this.termoPesquisa || '').trim().toLowerCase();
    if (!termo) {
      this.produtosFiltrados = [];
      return;
    }

    // 1) por nome do produto (checando se nome existe)
    let achados = this.produtosDisponiveis.filter(p =>
      (p.nome || '').toLowerCase().includes(termo)
    );

    // 2) por nome da loja (checando se nomeFantasia existe)
    const lojasEncontradas = this.lojas.filter(l =>
      (l.nomeFantasia || '').toLowerCase().includes(termo)
    );
    if (lojasEncontradas.length) {
      const ids = new Set(lojasEncontradas.map(l => l.idLoja));
      const daLoja = this.produtosDisponiveis.filter(p => ids.has(p.idLoja));
      achados = achados.concat(daLoja);
    }

    // 3) remover duplicatas por id
    const mapa = new Map<number, Produto>();
    achados.forEach(p => mapa.set(p.id, p));

    // 4) montar VMs (nome da loja + média avaliação + status da loja)
    const lojasPorId = new Map<number, Loja>(this.lojas.map(l => [Number(l.idLoja), l]));
    const vms: ProdutoCardVM[] = [];
    for (const p of mapa.values()) {
      const loja = lojasPorId.get(p.idLoja);
      const media = this.getMediaAvaliacao(p.id);
      const lojaFechada = loja ? !loja.status : false;

      vms.push({
        produto: { ...p, lojaFechada },
        nomeLoja: loja ? (loja.nomeFantasia || 'Loja') : 'Loja',
        mediaAvaliacao: media,
        mediaAvaliacaoInt: Math.round(media)
      });
    }

    // 5) ordenar por preço asc só para ficar estável
    this.produtosFiltrados = vms.sort((a, b) => a.produto.preco - b.produto.preco);
  }

  // ==== AVALIAÇÕES ====
  private getAvaliacoes(): Array<{ idProduto: number; idUsuario: number; estrelas: number; }> {
    const raw = localStorage.getItem(this.STORAGE_AVALIACOES);
    return raw ? JSON.parse(raw) : [];
  }

  private getMediaAvaliacao(produtoId: number): number {
    const avs = this.getAvaliacoes().filter(a => a.idProduto === produtoId);
    if (!avs.length) return 0;
    const soma = avs.reduce((acc, a) => acc + (Number(a.estrelas) || 0), 0);
    return Number((soma / avs.length).toFixed(1));
  }

  // ==== NAV ====
  async abrirDetalhesProduto(p: Produto & { lojaFechada?: boolean }) {
    if (p.lojaFechada) {
      const alert = await this.alertCtrl.create({
        header: 'Loja Fechada',
        message: 'Este produto não está disponível no momento, pois a loja está fechada.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    this.router.navigate(['/detalhes', p.id]);
  }

  irMenu() { this.router.navigate(['/inicio']); }
  irPesquisa() { this.router.navigate(['/pesquisa']); }
  irPerfil() { this.router.navigate(['/perfil']); }
  irCarrinho() { this.router.navigate(['/carrinho']); }

  async abrirLojaIcon() {
  const usuario = this.authService.getUsuarioLogado();

  if (!usuario) {
    this.navCtrl.navigateRoot('/login');
    return;
  }

  try {
    // Verifica na API se existe uma loja para o usuário logado
    const loja = await firstValueFrom(this.lojaService.getByUsuario(usuario.idUsuario));

    if (loja) {
      this.navCtrl.navigateRoot('/minha-loja');
    } else {
      const alert = await this.alertCtrl.create({
        header: 'Você não possui loja',
        message: 'Você ainda não possui uma loja. Deseja criar uma agora?',
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          { text: 'Criar loja', handler: () => this.navCtrl.navigateForward('/criar-loja') }
        ]
      });
      await alert.present();
    }
  } catch (error) {
    console.error('Erro ao verificar loja do usuário:', error);

    const alert = await this.alertCtrl.create({
      header: 'Erro',
      message: 'Não foi possível verificar sua loja. Tente novamente mais tarde.',
      buttons: ['OK']
    });
    await alert.present();
  }
}

}*/




















































/*
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProdutoService, Produto } from 'src/app/services/produto.service';
import { LojaService, Loja } from 'src/app/services/loja.service';
import { AuthService } from 'src/app/services/auth.service';
import { Usuario } from 'src/app/model/usuario';
import { AlertController, NavController } from '@ionic/angular';
import { LojaAccessService } from 'src/app/services/loja-access.service';
import { AvaliacaoService, Avaliacao } from 'src/app/services/avaliacao.service';

interface ProdutoCardVM {
  produto: Produto & { lojaFechada?: boolean };
  nomeLoja: string;
  mediaAvaliacao: number;    // 0..5 com 1 casa
  mediaAvaliacaoInt: number; // arredondado p/ estrelas
}

interface LojaCardVM {
  loja: Loja;
  produtos: Produto[]; // produtos da loja, se quiser mostrar miniaturas
}


@Component({
  selector: 'app-pesquisa',
  templateUrl: './pesquisa.page.html',
  styleUrls: ['./pesquisa.page.scss'],
  standalone: false
})
export class PesquisaPage implements OnInit {

  termoPesquisa = '';
  produtosDisponiveis: Produto[] = [];
  lojas: Loja[] = [];
  produtosFiltrados: ProdutoCardVM[] = [];
  usuarioLogado?: Usuario | null;
  lojasFiltradas: LojaCardVM[] = [];

  private readonly STORAGE_AVALIACOES = 'cefoods_avaliacoes';

  constructor(
    private produtoService: ProdutoService,
    private lojaService: LojaService,
    private authService: AuthService,
    private router: Router,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private avaliacaoService: AvaliacaoService
  ) { }

  ngOnInit() {
    this.usuarioLogado = this.authService.getUsuarioLogado();
    
    // somente produtos disponíveis
    this.produtoService.getAll().subscribe(prods => {
      this.produtosDisponiveis = prods.filter(p => p.disponivel);
    });

    // carregar lojas da API
    this.lojaService.getAll().subscribe(lojas => {
      this.lojas = lojas;
    });
  }

  // ==== BUSCA ====
  buscar() {
    const termo = (this.termoPesquisa || '').trim().toLowerCase();
    if (!termo) {
      this.produtosFiltrados = [];
      return;
    }

    // 1) por nome do produto
    let achados = this.produtosDisponiveis.filter(p =>
      (p.nome || '').toLowerCase().includes(termo)
    );

    // 2) por nome da loja
    const lojasEncontradas = this.lojas.filter(l =>
      (l.nomeFantasia || '').toLowerCase().includes(termo)
    );
    if (lojasEncontradas.length) {
      const ids = new Set(lojasEncontradas.map(l => l.idLoja));
      const daLoja = this.produtosDisponiveis.filter(p => {
        const idLoja = (p.loja?.idLoja ?? (p as any).idLoja);
        return ids.has(idLoja);
      });
      achados = achados.concat(daLoja);
    }

    // 3) remover duplicatas
    const mapa = new Map<number, Produto>();
    achados.forEach(p => mapa.set(p.idProduto, p));

    // 4) montar VMs
    const lojasPorId = new Map<number, Loja>(this.lojas.map(l => [l.idLoja, l]));
    const vms: ProdutoCardVM[] = [];
    for (const p of mapa.values()) {
      const idLoja = (p.loja?.idLoja ?? (p as any).idLoja);
      const loja = lojasPorId.get(idLoja);
      const lojaFechada = loja ? !Boolean(loja.status) : false;

      // pega média de avaliação já vinda da API
      const rawMedia = Number(
        (p as any).avaliacaoMedia ??
        (p as any).mediaAvaliacao ??
        0
      );
      const media = Number.isFinite(rawMedia) ? rawMedia : 0;

      vms.push({
        produto: { ...p, lojaFechada },
        nomeLoja: loja ? (loja.nomeFantasia || 'Loja') : 'Loja',
        mediaAvaliacao: media,
        mediaAvaliacaoInt: Math.round(media)
      });
    }

    // 5) ordenar por preço
    this.produtosFiltrados = vms.sort((a, b) => a.produto.preco - b.produto.preco);

    // === CRIAR CARDS DE LOJA ===
    this.lojasFiltradas = lojasEncontradas.map(l => ({
      loja: l,
      produtos: this.produtosDisponiveis.filter(p => (p.loja?.idLoja ?? (p as any).idLoja) === l.idLoja)
    }));

  }


  abrirPerfilLoja(idLoja: number) {
  this.router.navigate(['/perfil-loja', idLoja]);
}




  // ==== NAV ====
  async abrirDetalhesProduto(p: Produto & { lojaFechada?: boolean }) {
    if (p.lojaFechada) {
      const alert = await this.alertCtrl.create({
        header: 'Loja Fechada',
        message: 'Este produto não está disponível no momento, pois a loja está fechada.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    this.router.navigate(['/detalhes', p.idProduto]);
  }

  irMenu() { this.router.navigate(['/inicio']); }
  irPesquisa() { this.router.navigate(['/pesquisa']); }
  irPerfil() { this.router.navigate(['/perfil']); }
  irCarrinho() { this.router.navigate(['/carrinho']); }

  async abrirLojaIcon() {
    const usuario = this.authService.getUsuarioLogado();

    if (!usuario) {
      this.navCtrl.navigateRoot('/login');
      return;
    }

    try {
      const loja = await firstValueFrom(this.lojaService.getByUsuario(usuario.idUsuario));
      if (loja) {
        this.navCtrl.navigateRoot('/minha-loja');
      } else {
        const alert = await this.alertCtrl.create({
          header: 'Você não possui loja',
          message: 'Você ainda não possui uma loja. Deseja criar uma agora?',
          buttons: [
            { text: 'Cancelar', role: 'cancel' },
            { text: 'Criar loja', handler: () => this.navCtrl.navigateForward('/criar-loja') }
          ]
        });
        await alert.present();
      }
    } catch (error) {
      console.error('Erro ao verificar loja do usuário:', error);
      const alert = await this.alertCtrl.create({
        header: 'Erro',
        message: 'Não foi possível verificar sua loja. Tente novamente mais tarde.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }
}*/


import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProdutoService, Produto } from 'src/app/services/produto.service';
import { LojaService, Loja } from 'src/app/services/loja.service';
import { AuthService } from 'src/app/services/auth.service';
import { Usuario } from 'src/app/model/usuario';
import { AlertController, NavController } from '@ionic/angular';
import { LojaAccessService } from 'src/app/services/loja-access.service';

interface ProdutoCardVM {
  produto: Produto & { lojaFechada?: boolean };
  nomeLoja: string;
  mediaAvaliacao: number;
  mediaAvaliacaoInt: number;
}

interface LojaCardVM {
  loja: Loja;
  produtos: Produto[];
}

@Component({
  selector: 'app-pesquisa',
  templateUrl: './pesquisa.page.html',
  styleUrls: ['./pesquisa.page.scss'],
  standalone: false
})
export class PesquisaPage implements OnInit {

  termoPesquisa = '';
  produtosDisponiveis: Produto[] = [];
  lojas: Loja[] = [];
  produtosFiltrados: ProdutoCardVM[] = [];
  lojasFiltradas: LojaCardVM[] = [];
  usuarioLogado?: Usuario | null;

  constructor(
    private produtoService: ProdutoService,
    private lojaService: LojaService,
    private authService: AuthService,
    private router: Router,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private lojaAccessService: LojaAccessService
  ) { }

  ngOnInit() {
    this.usuarioLogado = this.authService.getUsuarioLogado();

    this.produtoService.getAll().subscribe(prods => {
      this.produtosDisponiveis = prods.filter(p => p.disponivel);
      if (this.termoPesquisa.trim().length) {
        this.buscar();
      }
    });

    this.lojaService.getAll().subscribe(lojas => {
      this.lojas = lojas;
      if (this.termoPesquisa.trim().length) {
        this.buscar();
      }
    });
  }

  buscar() {
    const termo = (this.termoPesquisa || '').trim().toLowerCase();
    if (!termo) {
      this.produtosFiltrados = [];
      this.lojasFiltradas = [];
      return;
    }

    // --- produtos por nome ---
    let achados = this.produtosDisponiveis.filter(p =>
      (p.nome || '').toLowerCase().includes(termo)
    );

    // --- lojas ---
    const lojasEncontradas = this.lojas.filter(l =>
      (l.nomeFantasia || '').toLowerCase().includes(termo)
    );
    const lojasElegiveis = lojasEncontradas.filter(l => !this.isLojaSuspensa(l));

    if (lojasElegiveis.length) {
      const ids = new Set(lojasElegiveis.map(l => Number(l.idLoja)));
      const produtosDaLoja = this.produtosDisponiveis.filter(p =>
        ids.has(this.obterIdLojaProduto(p) ?? -1)
      );
      achados = achados.concat(produtosDaLoja);

      this.lojasFiltradas = lojasElegiveis.map(l => ({
        loja: l,
        produtos: this.produtosDisponiveis.filter(p => (this.obterIdLojaProduto(p) ?? -1) === Number(l.idLoja))
      }));
    } else {
      this.lojasFiltradas = [];
    }

    // remover duplicatas
    const mapa = new Map<number, Produto>();
    achados.forEach(p => mapa.set(p.idProduto, p));

    const lojasPorId = new Map<number, Loja>(this.lojas.map(l => [Number(l.idLoja), l]));
    const vms: ProdutoCardVM[] = [];

    for (const p of mapa.values()) {
      const idLoja = this.obterIdLojaProduto(p);
      if (idLoja === null) {
        continue;
      }

      const loja = lojasPorId.get(idLoja);
      if (!loja || this.isLojaSuspensa(loja)) {
        continue;
      }

      const lojaFechada = !this.isLojaOperando(loja);

      const rawMedia = Number((p as any).avaliacaoMedia ?? (p as any).mediaAvaliacao ?? 0);
      const media = Number.isFinite(rawMedia) ? rawMedia : 0;

      vms.push({
        produto: { ...p, lojaFechada },
        nomeLoja: loja.nomeFantasia || 'Loja',
        mediaAvaliacao: media,
        mediaAvaliacaoInt: Math.round(media)
      });
    }

    this.produtosFiltrados = vms.sort((a, b) => a.produto.preco - b.produto.preco);
  }

  async abrirDetalhesProduto(produto: Produto & { lojaFechada?: boolean }) {
    const loja = this.obterLojaDoProduto(produto);
    const lojaSuspensa = this.isLojaSuspensa(loja);
    const lojaOperando = this.isLojaOperando(loja);

    if (lojaSuspensa) {
      await this.exibirAvisoLoja('Loja indisponível', 'Este produto não pode ser pedido porque a loja está suspensa no momento.');
      return;
    }

    if (!lojaOperando || produto.lojaFechada) {
      await this.exibirAvisoLoja('Loja fechada', 'Este produto não está disponível agora. Tente novamente quando a loja reabrir.');
      return;
    }

    const produtoId = (produto as any).idProduto ?? (produto as any).id;
    if (!produtoId) {
      console.warn('Produto sem identificador válido', produto);
      return;
    }
    this.router.navigate(['/detalhes', produtoId]);
  }

  abrirPerfilLoja(idLoja: number) {
    this.router.navigate(['/perfil-loja', idLoja]);
  }

  irMenu() { this.router.navigate(['/inicio']); }
  irPesquisa() { this.router.navigate(['/pesquisa']); }
  irPerfil() { this.router.navigate(['/perfil']); }
  irCarrinho() { this.router.navigate(['/carrinho']); }

  async abrirLojaIcon() {
    await this.lojaAccessService.abrirMinhaLojaOuPerguntar();
  }

  private obterIdLojaProduto(produto: Produto): number | null {
    const id = produto.loja?.idLoja ?? (produto as any).idLoja ?? (produto as any).id_loja;
    if (id === undefined || id === null) {
      return null;
    }
    const numeric = typeof id === 'number' ? id : Number(id);
    return Number.isFinite(numeric) ? Number(numeric) : null;
  }

  private obterLojaDoProduto(produto: Produto): Loja | undefined {
    const idLoja = this.obterIdLojaProduto(produto);
    if (idLoja === null) {
      return undefined;
    }
    return this.lojas.find(l => Number(l.idLoja) === idLoja);
  }

  private isLojaSuspensa(loja?: Loja): boolean {
    if (!loja) {
      return true;
    }
    return loja.statusAdm && loja.statusAdm !== 'ATIVA';
  }

  private isLojaOperando(loja?: Loja): boolean {
    return Boolean(loja && loja.status);
  }

  private async exibirAvisoLoja(header: string, message: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}


