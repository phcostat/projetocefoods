// src/app/pages/produto/produto-detalhe/detalhes.page.ts
/*
import { Component, OnInit } from '@angular/core';
// src/app/pages/produto/produto-detalhe/produto-detalhe.page.ts
import { ActivatedRoute } from '@angular/router';
import { ProdutoService, Produto } from 'src/app/services/produto.service';
import { AuthService } from 'src/app/services/auth.service'; //antes Usuario era importado aqui
import { Usuario } from 'src/app/model/usuario'; //essa linha nao existia
import { NavController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { CartService } from 'src/app/services/carrinho.service';
import { firstValueFrom } from 'rxjs';
import { LojaService } from 'src/app/services/loja.service';

interface Comentario {
  id: number;
  idProduto: number;
  idUsuario: number;
  nomeUsuario: string;
  fotoUsuario: string;
  data: string;
  texto: string;
}

@Component({
  selector: 'app-detalhes',
  templateUrl: './detalhes.page.html',
  styleUrls: ['./detalhes.page.scss'],
  standalone: false
})
export class DetalhesPage implements OnInit {

  produto?: Produto;
  quantidadeDesejada = 1;
  valorTotal = 0;
  usuarioLogado?: Usuario | null;
  avaliacao = 0; // 1 a 5 estrelas
  comentarios: Comentario[] = [];
  novoComentario = '';
  nomeUsuario = "";
  private readonly STORAGE_COMENTARIOS = 'cefoods_comentarios';
  private readonly STORAGE_AVALIACOES = 'cefoods_avaliacoes';

  constructor(
    private route: ActivatedRoute,
    private produtoService: ProdutoService,
    private authService: AuthService,
    private navCtrl: NavController,
    private router: Router,
    private alertCtrl: AlertController,
    private cartService: CartService,
    private lojaService: LojaService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.produto = this.produtoService.getById(id);
    this.usuarioLogado = this.authService.getUsuarioLogado();
    if (this.usuarioLogado) {
      this.nomeUsuario = this.usuarioLogado.nome || this.usuarioLogado.login || 'Usuário';
    }
    if (this.produto) {
      this.quantidadeDesejada = 1;
      this.calcularValorTotal();
      this.carregarComentarios();
      this.carregarAvaliacao();
    }
  }

  ionViewWillEnter() {
    // Atualiza usuário/avaliacao/comentários sempre que a página for exibida
    this.usuarioLogado = this.authService.getUsuarioLogado();
    if (this.usuarioLogado) {
      this.nomeUsuario = this.usuarioLogado.nome || this.usuarioLogado.login || 'Usuário';
    }
    // recarregar avaliações/comentários caso tenham mudado
    if (this.produto) {
      this.carregarComentarios();
      this.carregarAvaliacao();
      // recalcula limite se estoque mudou
      if (this.quantidadeDesejada > (this.produto.quant || 1)) {
        this.quantidadeDesejada = Math.max(1, this.produto.quant || 1);
        this.calcularValorTotal();
      }
    }
  }

  alterarQuantidade(delta: number) {
    if (!this.produto) return;
    const novaQtd = this.quantidadeDesejada + delta;
    if (novaQtd >= 1 && novaQtd <= (this.produto.quant ?? Number.MAX_SAFE_INTEGER)) {
      this.quantidadeDesejada = novaQtd;
      this.calcularValorTotal();
    } else if (novaQtd > (this.produto.quant ?? 0)) {
      // informar usuário que atingiu o limite de estoque
      this.alertCtrl.create({
        header: 'Estoque insuficiente',
        message: `Não há estoque suficiente. Máximo disponível: ${this.produto.quant}`,
        buttons: ['OK']
      }).then(a => a.present());
    }
  }

  calcularValorTotal() {
    if (this.produto) {
      this.valorTotal = Number((this.produto.preco * this.quantidadeDesejada).toFixed(2));
    } else {
      this.valorTotal = 0;
    }
  }

  async adicionarAoCarrinho() {
    if (!this.produto) {
      const a = await this.alertCtrl.create({ header: 'Erro', message: 'Produto inválido.', buttons: ['OK'] });
      await a.present();
      return;
    }

    // valida com o CartService (verifica mesma loja e estoque)
    const valid = this.cartService.canAddProduct(this.produto, this.quantidadeDesejada);
    if (!valid.ok) {
      const a = await this.alertCtrl.create({ header: 'Não foi possível adicionar', message: valid.message || '', buttons: ['OK'] });
      await a.present();
      return;
    }

    try {
      this.cartService.addProduct(this.produto, this.quantidadeDesejada);
      // redireciona automaticamente para o carrinho
      await this.navCtrl.navigateForward('/carrinho');
    } catch (err: any) {
      const a = await this.alertCtrl.create({ header: 'Erro', message: err?.message || 'Falha ao adicionar ao carrinho', buttons: ['OK'] });
      await a.present();
    }
  }

  avaliar(estrelas: number) {
    if (!this.usuarioLogado || !this.produto) return;
    this.avaliacao = estrelas;

    const avaliacoes = this.getAvaliacoes();
    const existente = avaliacoes.find((a: any) => a.idProduto === this.produto!.id && a.idUsuario === this.usuarioLogado!.idUsuario);

    if (existente) {
      existente.estrelas = estrelas;
    } else {
      avaliacoes.push({
        idProduto: this.produto.id,
        idUsuario: this.usuarioLogado.idUsuario,
        estrelas
      });
    }

    localStorage.setItem(this.STORAGE_AVALIACOES, JSON.stringify(avaliacoes));
  }

  carregarAvaliacao() {
    if (!this.usuarioLogado || !this.produto) return;
    const avaliacoes = this.getAvaliacoes();
    const existente = avaliacoes.find((a: any) => a.idProduto === this.produto!.id && a.idUsuario === this.usuarioLogado!.idUsuario);
    if (existente) {
      this.avaliacao = existente.estrelas;
    } else {
      this.avaliacao = 0;
    }
  }

  getAvaliacoes() {
    const raw = localStorage.getItem(this.STORAGE_AVALIACOES);
    return raw ? JSON.parse(raw) : [];
  }

  carregarComentarios() {
    const raw = localStorage.getItem(this.STORAGE_COMENTARIOS);
    const todos: Comentario[] = raw ? JSON.parse(raw) : [];
    this.comentarios = todos.filter(c => c.idProduto === this.produto?.id).sort((a,b) => b.id - a.id);
  }

  async adicionarComentario() {
    if (!this.usuarioLogado || !this.novoComentario.trim() || !this.produto) {
      // opcional: avisar usuário
      if (!this.usuarioLogado) {
        const a = await this.alertCtrl.create({ header: 'Login necessário', message: 'Faça login para comentar.', buttons: ['OK'] });
        await a.present();
      }
      return;
    }

    const raw = localStorage.getItem(this.STORAGE_COMENTARIOS);
    const todos: Comentario[] = raw ? JSON.parse(raw) : [];

    const novo: Comentario = {
      id: Date.now(),
      idProduto: this.produto.id,
      idUsuario: this.usuarioLogado.idUsuario,
      nomeUsuario: this.usuarioLogado.nome || this.usuarioLogado.login,
      fotoUsuario: (this.usuarioLogado as any).fotoPerfil || (this.usuarioLogado as any).foto || 'assets/img/default-user.png',
      data: new Date().toLocaleDateString(),
      texto: this.novoComentario.trim()
    };

    todos.push(novo);
    localStorage.setItem(this.STORAGE_COMENTARIOS, JSON.stringify(todos));

    this.novoComentario = '';
    this.carregarComentarios();
  }

  irMenu() {
    this.router.navigate(['/inicio']);
  }

  irPesquisa() {
    this.router.navigate(['/pesquisa']);
  }

  irPerfil() {
    this.router.navigate(['/perfil']);
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

}*/


// src/app/pages/produto/produto-detalhe/detalhes.page.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProdutoService, Produto } from 'src/app/services/produto.service';
import { AuthService } from 'src/app/services/auth.service';
import { Usuario } from 'src/app/model/usuario';
import { NavController, AlertController, ToastController } from '@ionic/angular';
import { CartService } from 'src/app/services/carrinho.service';
import { firstValueFrom } from 'rxjs';
import { ComentarioService, Comentario } from 'src/app/services/comentario.service';
import { AvaliacaoService } from 'src/app/services/avaliacao.service';
import { LojaAccessService } from 'src/app/services/loja-access.service';
import { FavoritoService } from 'src/app/services/favorito.service';
/*interface Comentario {
  id: number;
  idProduto: number;
  idUsuario: number;
  nomeUsuario: string;
  fotoUsuario: string;
  data: string;
  texto: string;
}*/

type ComentarioView = Comentario & { autorNome: string; autorFoto: string };

@Component({
  selector: 'app-detalhes',
  templateUrl: './detalhes.page.html',
  styleUrls: ['./detalhes.page.scss'],
  standalone: false
})

export class DetalhesPage implements OnInit {

  produto?: Produto;
  quantidadeDesejada = 1;
  valorTotal = 0;
  usuarioLogado?: Usuario | null;
  avaliacao = 0; // minha avaliação
  mediaAvaliacoes = 0; // média geral
  favoritoAtivo = false;
  processandoFavorito = false;
  comentarios: ComentarioView[] = [];
  novoComentario = '';
  nomeUsuario = "";
  //private readonly STORAGE_COMENTARIOS = 'cefoods_comentarios';
  private readonly STORAGE_AVALIACOES = 'cefoods_avaliacoes';

  constructor(
    private route: ActivatedRoute,
    private produtoService: ProdutoService,
    private authService: AuthService,
    private navCtrl: NavController,
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private cartService: CartService,
    private comentarioService: ComentarioService,
    private avaliacaoService: AvaliacaoService,
    private favoritoService: FavoritoService,
    private lojaAccessService: LojaAccessService
  ) { }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // Agora busca via API
    this.produtoService.getById(id).subscribe(produto => {
      this.produto = produto;
      // Normaliza média (aceitar vários nomes)
      const rawMedia = Number(
        produto?.avaliacaoMedia ??
        produto?.mediaAvaliacao ??
        //produto?.avaliacao_media ??
        //produto?.rating ??
        0
      );
      const media = Number.isFinite(rawMedia) ? rawMedia : 0;
      (this.produto as any).mediaAvaliacao = media;
      (this.produto as any).mediaAvaliacaoInt = Math.round(media);
      if (this.produto) {
        this.quantidadeDesejada = 1;
        this.calcularValorTotal();
        this.carregarComentarios();
        this.carregarAvaliacao();
        this.atualizarEstadoFavorito();
      }
    });

    this.usuarioLogado = this.authService.getUsuarioLogado();
    if (this.usuarioLogado) {
      this.nomeUsuario = this.usuarioLogado.nome || this.usuarioLogado.login || 'Usuário';
    }
  }

  ionViewWillEnter() {
    this.usuarioLogado = this.authService.getUsuarioLogado();
    if (this.usuarioLogado) {
      this.nomeUsuario = this.usuarioLogado.nome || this.usuarioLogado.login || 'Usuário';
    }
    if (this.produto) {
      this.carregarComentarios();
      this.carregarAvaliacao();
      this.atualizarEstadoFavorito();

      // garantir limite do estoque
      if (this.quantidadeDesejada > (this.produto.estoque || 1)) {
        this.quantidadeDesejada = Math.max(1, this.produto.estoque || 1);
        this.calcularValorTotal();
      }
    }
  }

  alterarQuantidade(delta: number) {
    if (!this.produto) return;
    const novaQtd = this.quantidadeDesejada + delta;
    if (novaQtd >= 1 && novaQtd <= (this.produto.estoque ?? Number.MAX_SAFE_INTEGER)) {
      this.quantidadeDesejada = novaQtd;
      this.calcularValorTotal();
    } else if (novaQtd > (this.produto.estoque ?? 0)) {
      this.alertCtrl.create({
        header: 'Estoque insuficiente',
        message: `Não há estoque suficiente. Máximo disponível: ${this.produto.estoque}`,
        buttons: ['OK']
      }).then(a => a.present());
    }
  }

  calcularValorTotal() {
    if (this.produto) {
      this.valorTotal = Number((this.produto.preco * this.quantidadeDesejada).toFixed(2));
    } else {
      this.valorTotal = 0;
    }
  }

  async adicionarAoCarrinho() {
    if (!this.produto) {
      const a = await this.alertCtrl.create({ header: 'Erro', message: 'Produto inválido.', buttons: ['OK'] });
      await a.present();
      return;
    }

    const valid = await this.cartService.canAddProduct(this.produto, this.quantidadeDesejada);
    if (!valid.ok) {
      const a = await this.alertCtrl.create({
        header: 'Não foi possível adicionar',
        message: valid.message || '',
        buttons: ['OK']
      });
      await a.present();
      return;
    }

    try {
      await this.cartService.addProduct(this.produto, this.quantidadeDesejada);
      await this.navCtrl.navigateForward('/carrinho');
    } catch (err: any) {
      const a = await this.alertCtrl.create({
        header: 'Erro',
        message: err?.message || 'Falha ao adicionar ao carrinho',
        buttons: ['OK']
      });
      await a.present();
    }
  }



  // 🔹 Avaliação via API
  async avaliar(estrelas: number) {
    if (!this.usuarioLogado || !this.produto) return;
    this.avaliacao = estrelas;

    try {
      await firstValueFrom(
        this.avaliacaoService.avaliar(this.produto.idProduto, this.usuarioLogado.idUsuario, estrelas)
      );
      this.carregarAvaliacao();
    } catch (err) {
      console.error('Erro ao avaliar:', err);
    }
  }

  carregarAvaliacao() {
    if (!this.usuarioLogado || !this.produto) return;

    this.avaliacaoService.listarPorProduto(this.produto.idProduto).subscribe(avaliacoes => {
      // pega minha avaliação
      const minha = avaliacoes.find(a => a.usuario?.idUsuario === this.usuarioLogado!.idUsuario);
      this.avaliacao = minha ? minha.estrelas : 0;

      // média geral
      if (avaliacoes.length > 0) {
        this.mediaAvaliacoes = avaliacoes.reduce((sum, a) => sum + a.estrelas, 0) / avaliacoes.length;
      } else {
        this.mediaAvaliacoes = 0;
      }
    });
  }


  // 🔹 Carregar comentários do backend
  carregarComentarios() {
    if (!this.produto) return;
    this.comentarioService.listarPorProduto(this.produto.idProduto).subscribe({
      next: (lista) => {
        this.comentarios = lista
          .map((c) => this.enriquecerComentario(c))
          .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
      },
      error: (err) => console.error('Erro ao carregar comentários', err)
    });
  }

  // 🔹 Criar comentário
  async adicionarComentario() {
    if (!this.usuarioLogado || !this.novoComentario.trim() || !this.produto) {
      const a = await this.alertCtrl.create({
        header: 'Login necessário',
        message: 'Faça login para comentar.',
        buttons: ['OK']
      });
      await a.present();
      return;
    }

    this.comentarioService.criarComentario({
      texto: this.novoComentario.trim(),
      idProduto: this.produto.idProduto,
      idUsuario: this.usuarioLogado.idUsuario
    }).subscribe({
      next: () => {
        this.novoComentario = '';
        this.carregarComentarios();
      },
      error: (err) => console.error('Erro ao salvar comentário', err)
    });
  }

  private atualizarEstadoFavorito() {
    if (!this.usuarioLogado || !this.produto) {
      this.favoritoAtivo = false;
      return;
    }

    this.favoritoService
      .verificar(this.usuarioLogado.idUsuario, this.produto.idProduto)
      .subscribe({
        next: (favorito) => (this.favoritoAtivo = favorito),
        error: () => (this.favoritoAtivo = false)
      });
  }

  async alternarFavorito() {
    if (!this.produto) {
      return;
    }

    if (!this.usuarioLogado) {
      const alert = await this.alertCtrl.create({
        header: 'Login necessário',
        message: 'Você precisa estar logado para favoritar produtos.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    if (this.processandoFavorito) {
      return;
    }

    this.processandoFavorito = true;

    try {
      if (this.favoritoAtivo) {
        await firstValueFrom(
          this.favoritoService.remover(this.usuarioLogado.idUsuario, this.produto.idProduto)
        );
        this.favoritoAtivo = false;
        await this.exibirToast('Produto removido dos favoritos.');
      } else {
        await firstValueFrom(
          this.favoritoService.adicionar({
            idUsuario: this.usuarioLogado.idUsuario,
            idProduto: this.produto.idProduto
          })
        );
        this.favoritoAtivo = true;
        await this.exibirToast('Produto salvo nos favoritos.');
      }
    } catch (error) {
      console.error('Erro ao atualizar favorito', error);
      const alert = await this.alertCtrl.create({
        header: 'Erro',
        message: 'Não foi possível atualizar seus favoritos. Tente novamente.',
        buttons: ['OK']
      });
      await alert.present();
    } finally {
      this.processandoFavorito = false;
    }
  }

  private async exibirToast(mensagem: string) {
    const toast = await this.toastCtrl.create({
      message: mensagem,
      duration: 2000,
      position: 'bottom',
      color: 'dark'
    });
    await toast.present();
  }

  irMenu() { this.router.navigate(['/inicio']); }
  irPesquisa() { this.router.navigate(['/pesquisa']); }
  irPerfil() { this.router.navigate(['/perfil']); }

  async abrirLojaIcon() {
    await this.lojaAccessService.abrirMinhaLojaOuPerguntar();
  }

  private enriquecerComentario(comentario: Comentario): ComentarioView {
    return {
      ...comentario,
      autorNome: this.resolverNomeComentario(comentario),
      autorFoto: this.resolverFotoComentario(comentario)
    };
  }

  private resolverNomeComentario(comentario: Comentario): string {
    if (comentario.nomeUsuario && comentario.nomeUsuario.trim()) {
      return comentario.nomeUsuario.trim();
    }
    const partes = [comentario.usuario?.nome, comentario.usuario?.sobrenome]
      .filter((parte) => !!parte && parte.trim().length > 0)
      .map((parte) => (parte as string).trim());
    if (partes.length > 0) {
      return partes.join(' ');
    }
    return 'Usuário';
  }

  private resolverFotoComentario(comentario: Comentario): string {
    return (
      comentario.fotoUsuario ||
      comentario.usuario?.foto ||
      'assets/img/default-user.png'
    );
  }
}

