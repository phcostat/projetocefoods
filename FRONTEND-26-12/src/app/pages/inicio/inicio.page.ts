// src/app/pages/inicio/inicio.page.ts
/*import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { ProdutoService } from 'src/app/services/produto.service';
import { LojaService, Loja } from 'src/app/services/loja.service';
import { Produto } from 'src/app/model/produto';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: false
})
export class InicioPage implements OnInit {
  nomeUsuario = '';
  // pode continuar any[] pra aceitar o campo extra lojaFechada sem reclamar
  produtos: any[] = [];

  constructor(
    private authService: AuthService,
    private produtoService: ProdutoService,
    private lojaService: LojaService,
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private router: Router
  ) { }

  ngOnInit() {
    const u = this.authService.getUsuarioLogado();
    if (u) {
      this.nomeUsuario = u.nome || u.login || 'Usuário';
    }
    this.carregarProdutos();
  }

  ionViewWillEnter() {
    const u = this.authService.getUsuarioLogado();
    if (u) this.nomeUsuario = u.nome || u.login || 'Usuário';
    this.carregarProdutos();
  }



  // trecho do InicioPage
  // src/app/pages/inicio/inicio.page.ts (apenas a função)
  async carregarProdutos() {
    try {
      const prods = await this.produtoService.getAllDisponiveis(); // assume que retorna Promise<Produto[]> ou Observable convertido

      const produtosComLoja = await Promise.all(
        (prods || []).map(async (p: any) => {
          try {
            // pega id da loja de possíveis formatos
            const idLoja = p.loja?.idLoja ?? p.idLoja ?? p.id_loja ?? (p.loja && (p.loja.idLoja ?? p.loja.id));
            const loja = idLoja ? await firstValueFrom(this.lojaService.getById(Number(idLoja))) : null;
            const lojaFechada = !(loja && loja.status === true);

            // Normaliza a média de avaliação: aceita avaliacaoMedia, mediaAvaliacao, avaliacao_media etc.
            const rawMedia = Number(
              p.avaliacaoMedia ??
              p.mediaAvaliacao ??
              p.avaliacao_media ??
              p.rating ??
              p.averageRating ??
              0
            );

            const mediaAvaliacao = Number.isFinite(rawMedia) ? Number(rawMedia) : 0;
            // inteiro para preencher estrelas (arredondamento)
            const mediaAvaliacaoInt = Math.round(mediaAvaliacao);

            return {
              ...p,
              nomeLoja: loja ? loja.nomeFantasia : 'Loja',
              lojaFechada,
              mediaAvaliacao,
              mediaAvaliacaoInt
            };
          } catch (error) {
            console.error('Erro ao carregar loja do produto:', error);
            return {
              ...p,
              nomeLoja: 'Loja',
              lojaFechada: false,
              mediaAvaliacao: Number(p.avaliacaoMedia ?? p.mediaAvaliacao ?? 0),
              mediaAvaliacaoInt: Math.round(Number(p.avaliacaoMedia ?? p.mediaAvaliacao ?? 0))
            };
          }
        })
      );

      // debug rápido (remova em produção)
      console.log('produtosComLoja', produtosComLoja);

      this.produtos = produtosComLoja;
      this.semResultadosFavoritos = this.mostrarFavoritos && this.produtos.length === 0;
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      this.produtos = [];
      this.semResultadosFavoritos = this.mostrarFavoritos;
    }
  }



  private isLojaAbertaAgora(loja: any): boolean {
    if (!loja.status) return false; // loja desativada

    const agora = new Date();
    const horaAtual = agora.getHours();
    const minutoAtual = agora.getMinutes();
    const diasSemana = ['DOMINGO', 'SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO'];
    const hoje = diasSemana[agora.getDay()];

    // procura turnos do dia
    const horariosHoje = (loja.horarios || []).filter((h: any) => h.diaSemana === hoje);

    for (const h of horariosHoje) {
      if (h.turno === 'MANHA' && horaAtual >= 7 && horaAtual < 12) return true;
      if (h.turno === 'TARDE' && horaAtual >= 12 && horaAtual < 18) return true;
      if (h.turno === 'NOITE' && horaAtual >= 18 && horaAtual <= 22) return true;
    }

    return false;
  }



  async abrirDetalhesProduto(produto: Produto & { lojaFechada?: boolean }) {
    // se a loja estiver fechada, mostramos o aviso e não navegamos
    if (produto?.lojaFechada) {
      const alert = await this.alertCtrl.create({
        header: 'Loja Fechada',
        message: 'Este produto não está disponível no momento, pois a loja está fechada.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    if (!produto?.idProduto) {
      console.error('Produto sem ID', produto);
      return;
    }
    this.router.navigate(['/detalhes', produto.idProduto]);
  }

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


  irPesquisa() { this.router.navigate(['/pesquisa']); }
  irPerfil() { this.router.navigate(['/perfil']); }
  irCarrinho() { this.router.navigate(['/carrinho']); }
  irNotificacoes() { this.router.navigate(['/notificacao']); }
}*/

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { ProdutoService } from 'src/app/services/produto.service';
import { LojaService, Loja } from 'src/app/services/loja.service';
import { CategoriaService, Categoria } from 'src/app/services/categoria.service';
import { Produto } from 'src/app/model/produto';
import { firstValueFrom } from 'rxjs';
import { LojaAccessService } from 'src/app/services/loja-access.service';
import { FavoritoService } from 'src/app/services/favorito.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: false
})
export class InicioPage implements OnInit {
  nomeUsuario = '';
  produtos: any[] = [];
  categorias: Categoria[] = [];
  categoriaSelecionada: number | null = null;
  mostrarFavoritos = false;
  semResultadosFavoritos = false;
  mensagemFavoritosVazio = 'Você ainda não favoritou nenhum produto.';

  constructor(
    private authService: AuthService,
    private produtoService: ProdutoService,
    private lojaService: LojaService,
    private categoriaService: CategoriaService,
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private router: Router,
    private lojaAccessService: LojaAccessService,
    private favoritoService: FavoritoService
  ) {}

  async ngOnInit() {
    const u = this.authService.getUsuarioLogado();
    if (u) this.nomeUsuario = u.nome || u.login || 'Usuário';

    await this.carregarCategorias();
    await this.carregarProdutos();
  }

  async carregarCategorias() {
    try {
      this.categorias = await firstValueFrom(this.categoriaService.getAll());
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
      this.categorias = [];
    }
  }

  async carregarProdutos() {
    try {
      this.semResultadosFavoritos = false;
      let prods: any[] = [];
      const usuario = this.authService.getUsuarioLogado();

      if (this.mostrarFavoritos) {
        if (!usuario?.idUsuario) {
          this.produtos = [];
          this.semResultadosFavoritos = true;
          this.mensagemFavoritosVazio = 'Entre na sua conta para salvar e ver seus favoritos.';
          return;
        }

        prods = await firstValueFrom(this.favoritoService.listarPorUsuario(usuario.idUsuario));
        prods = prods ?? [];

        if (this.categoriaSelecionada !== null) {
          prods = prods.filter(p => {
            const categoriaId = p.categoria?.idCategoria ?? p.idCategoria ?? p.id_categoria;
            return Number(categoriaId) === this.categoriaSelecionada;
          });
        }

        this.mensagemFavoritosVazio = 'Você ainda não favoritou nenhum produto.';
      } else if (this.categoriaSelecionada !== null) {
        prods = await firstValueFrom(this.produtoService.getByCategoria(this.categoriaSelecionada));
        prods = prods.filter(p => p.disponivel !== false);
      } else {
        prods = await this.produtoService.getAllDisponiveis();
      }

      let lojasDisponiveis: Loja[] = [];
      try {
        lojasDisponiveis = await firstValueFrom(this.lojaService.getAll());
      } catch (erroLoja) {
        console.error('Erro ao carregar lojas para o menu principal:', erroLoja);
      }

      const lojasPorId = new Map<number, Loja>(lojasDisponiveis.map(loja => [loja.idLoja, loja]));

      const produtosComLoja = prods
        .map((p: any) => {
          const idLoja = p.loja?.idLoja ?? p.idLoja ?? p.id_loja ?? (p.loja && (p.loja.idLoja ?? p.loja.id));
          if (!idLoja) {
            return null;
          }

          const loja = lojasPorId.get(Number(idLoja));
          if (!loja) {
            return null;
          }

          const lojaSuspensa = loja.statusAdm && loja.statusAdm !== 'ATIVA';
          if (lojaSuspensa) {
            return null;
          }

          const lojaFechada = !Boolean(loja.status);

          const rawMedia = Number(
            p.avaliacaoMedia ?? p.mediaAvaliacao ?? p.avaliacao_media ?? p.rating ?? p.averageRating ?? 0
          );
          const mediaAvaliacao = Number.isFinite(rawMedia) ? Number(rawMedia) : 0;
          const mediaAvaliacaoInt = Math.round(mediaAvaliacao);

          return {
            ...p,
            nomeLoja: loja.nomeFantasia || 'Loja',
            lojaFechada,
            mediaAvaliacao,
            mediaAvaliacaoInt
          };
        })
        .filter((item): item is any => Boolean(item));

      this.produtos = produtosComLoja;
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      this.produtos = [];
    }
  }

  filtrarPorCategoria(idCategoria: number | null) {
    this.categoriaSelecionada = idCategoria;
    this.carregarProdutos();
  }

  async abrirDetalhesProduto(produto: Produto & { lojaFechada?: boolean }) {
    if (produto?.lojaFechada) {
      const alert = await this.alertCtrl.create({
        header: 'Loja Fechada',
        message: 'Este produto não está disponível no momento.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }
    if (!produto?.idProduto) return;
    this.router.navigate(['/detalhes', produto.idProduto]);
  }

  async abrirLojaIcon() {
    await this.lojaAccessService.abrirMinhaLojaOuPerguntar();
  }

  obterTituloMenu(): string {
    if (this.categoriaSelecionada === null) {
      return 'MENU PRINCIPAL';
    }

    const categoria = this.categorias.find(c => c.idCategoria === this.categoriaSelecionada);
    return (categoria?.nome || 'Menu Principal').toUpperCase();
  }

  nomeCategoriaAtual(): string {
    if (this.categoriaSelecionada === null) {
      return '';
    }
    const categoria = this.categorias.find(c => c.idCategoria === this.categoriaSelecionada);
    return categoria?.nome || '';
  }

  irPesquisa() { this.router.navigate(['/pesquisa']); }
  irPerfil() { this.router.navigate(['/perfil']); }
  irCarrinho() { this.router.navigate(['/carrinho']); }
  irNotificacoes() { this.router.navigate(['/notificacao']); }
}

