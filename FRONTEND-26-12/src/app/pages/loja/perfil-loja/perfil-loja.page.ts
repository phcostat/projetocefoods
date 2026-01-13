import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Loja, LojaService } from 'src/app/services/loja.service';
import { Produto, ProdutoService } from 'src/app/services/produto.service';
import { CategoriaService, Categoria } from 'src/app/services/categoria.service';
import { firstValueFrom } from 'rxjs';
import { AlertController } from '@ionic/angular';
//PAREI AQUI COM O CÓDIGO DO CEFOODS
@Component({
  selector: 'app-perfil-loja',
  templateUrl: './perfil-loja.page.html',
  styleUrls: ['./perfil-loja.page.scss'],
  standalone:false
})
export class PerfilLojaPage implements OnInit {
  loja: Loja | undefined;
  produtos: Produto[] = [];
  categorias: Categoria[] = [];
  produtosPorCategoria: { [key: number]: Produto[] } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private lojaService: LojaService,
    private produtoService: ProdutoService,
    private categoriaService: CategoriaService,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    const idLoja = Number(this.route.snapshot.paramMap.get('idLoja'));
    if (!idLoja) {
      console.error('ID da loja não fornecido');
      return;
    }

    await this.carregarLoja(idLoja);
    await this.carregarCategorias();
    await this.carregarProdutos(idLoja);
  }

  async carregarLoja(idLoja: number) {
    try {
      this.loja = await firstValueFrom(this.lojaService.getById(idLoja));
    } catch (err) {
      console.error('Erro ao carregar loja:', err);
    }
  }

  async carregarCategorias() {
    try {
      this.categorias = await firstValueFrom(this.categoriaService.getAll());
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
      this.categorias = [];
    }
  }

  async carregarProdutos(idLoja: number) {
    try {
      const recebidos = await firstValueFrom(this.produtoService.getByLoja(idLoja));

      // Normaliza shape vindo do backend (suporta tanto campos aninhados quanto planos)
      this.produtos = (recebidos || []).map((p: any) => {
        const idCategoria = p.idCategoria ?? p?.categoria?.idCategoria ?? p?.categoriaId ?? null;
        const imagem = p.imagem || p.foto || 'assets/imagem-produto.png';
        const media = Number(p.avaliacaoMedia ?? p.media ?? 0);
        return {
          ...p,
          idCategoria,
          imagem,
          mediaAvaliacao: media,
          mediaAvaliacaoInt: Math.round(media)
        } as Produto;
      });

      // Se categorias não vieram (ou falharam), derivar dos produtos
      if (!this.categorias || this.categorias.length === 0) {
        const mapa: { [key: number]: Categoria } = {} as any;
        for (const p of this.produtos) {
          if (p.idCategoria != null) {
            const nome = (p as any)?.categoria?.nome || `Categoria ${p.idCategoria}`;
            mapa[p.idCategoria] = mapa[p.idCategoria] || { idCategoria: p.idCategoria as number, nome, descricao: '' } as Categoria;
          }
        }
        this.categorias = Object.values(mapa).sort((a, b) => a.nome.localeCompare(b.nome));
      }

      // Agrupa produtos por categoria (após garantir categorias)
      this.produtosPorCategoria = {};
      for (const c of this.categorias) {
        this.produtosPorCategoria[c.idCategoria] = this.produtos.filter(p => (p as any).idCategoria === c.idCategoria);
      }

    } catch (err) {
      console.error('Erro ao carregar produtos da loja:', err);
      this.produtos = [];
    }
  }

  // filtro removido conforme novo layout; apenas agrupamento por categoria

  getCategoriaNome(idCategoria?: number): string {
    if (!idCategoria) return '';
    const c = this.categorias.find(x => x.idCategoria === idCategoria);
    return c?.nome || '';
  }

  abrirDetalhesProduto(produto: Produto) {
    if (!produto?.idProduto) {
      return;
    }

    if (this.lojaSuspensa) {
      this.exibirAvisoLoja('Loja indisponível', 'Este produto não pode ser pedido porque a loja está suspensa no momento.');
      return;
    }

    if (this.lojaFechada) {
      this.exibirAvisoLoja('Loja fechada', 'Este produto não está disponível agora. Tente novamente quando a loja reabrir.');
      return;
    }

    this.router.navigate(['/detalhes', produto.idProduto]);
  }

  voltar() { this.router.navigate(['/inicio']); }
  irPesquisa() { this.router.navigate(['/pesquisa']); }
  irPerfil() { this.router.navigate(['/perfil']); }
  irCarrinho() { this.router.navigate(['/carrinho']); }
  irNotificacoes() { this.router.navigate(['/notificacao']); }

  abrirChat() {
    if (!this.loja?.idLoja) return;
    // sellerId prioritiza o dono da loja (usuario.idUsuario); fallback para idLoja apenas se necessário
    const sellerId = this.loja?.usuario?.idUsuario || (this.loja as any).idUsuario || (this.loja as any).usuarioId || this.loja.idLoja;
    this.router.navigate(['/chat', sellerId]);
  }

  get lojaSuspensa(): boolean {
    return this.isLojaSuspensa(this.loja);
  }

  get lojaFechada(): boolean {
    return !this.isLojaOperando(this.loja);
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
