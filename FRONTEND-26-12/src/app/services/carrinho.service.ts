// src/app/services/cart.service.ts
/*import { Injectable } from '@angular/core';
import { Produto } from './produto.service';
import { AuthService } from './auth.service';

export interface CartItem {
  produtoId: number;
  idLoja: number;
  nome: string;
  precoUnit: number;
  quantidade: number;
  foto?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly KEY_PREFIX = 'cefoods_cart_';

  constructor(private authService: AuthService) {}

  private getStorageKey(): string {
    const usuario = this.authService.getUsuarioLogado();
    if (!usuario || !usuario.idUsuario) {
      return this.KEY_PREFIX + 'anon'; // caso não logado
    }
    return this.KEY_PREFIX + usuario.idUsuario;
  }

  private readCart(): CartItem[] {
    const raw = localStorage.getItem(this.getStorageKey());
    return raw ? JSON.parse(raw) : [];
  }

  private saveCart(items: CartItem[]) {
    localStorage.setItem(this.getStorageKey(), JSON.stringify(items));
  }

  getCart(): CartItem[] {
    return this.readCart();
  }

  clearCart() {
    localStorage.removeItem(this.getStorageKey());
  }

  // verifica se é permitido adicionar o produto (mesma loja ou carrinho vazio)
  canAddProduct(produto: Produto, quantidade: number): { ok: boolean; message?: string } {
    if (!produto) return { ok: false, message: 'Produto inválido' };
    if (!produto.disponivel) return { ok: false, message: 'Produto indisponível' };
    if (quantidade < 1) return { ok: false, message: 'Quantidade inválida' };
    if (quantidade > (produto.estoque ?? 0)) {
      return { ok: false, message: `Estoque insuficiente (máx ${produto.estoque})` };
    }

    const items = this.getCart();
    if (items.length === 0) return { ok: true };

    const lojaId = items[0].idLoja;
    if (lojaId !== produto.idLoja) {
      return { ok: false, message: 'O carrinho já contém itens de outra loja. Finalize ou esvazie o carrinho.' };
    }

    // se for o mesmo produto, validar estoque somando quantidades
    const existing = items.find(i => i.produtoId === produto.idProduto);
    const totalWouldBe = (existing ? existing.quantidade : 0) + quantidade;
    if (totalWouldBe > (produto.estoque ?? 0)) {
      return { ok: false, message: `Somando quantidades, ultrapassa o estoque (máx ${produto.estoque}).` };
    }

    return { ok: true };
  }

  // adiciona o produto somando quantidades caso já exista
  addProduct(produto: Produto, quantidade: number) {
    const items = this.getCart();
    const existingIndex = items.findIndex(i => i.produtoId === produto.idProduto);

    if (existingIndex > -1) {
      items[existingIndex].quantidade += quantidade;
    } else {
      items.push({
        produtoId: produto.idProduto,
        idLoja: produto.idLoja,
        nome: produto.nome,
        precoUnit: produto.preco,
        quantidade,
        foto: produto.foto || ''
      });
    }
    this.saveCart(items);
  }

  removeProduct(produtoId: number) {
    let items = this.getCart();
    items = items.filter(i => i.produtoId !== produtoId);
    this.saveCart(items);
  }

  // retorna total do carrinho
  getTotal(): number {
    const items = this.getCart();
    return items.reduce((acc, it) => acc + it.precoUnit * it.quantidade, 0);
  }

  // retorna id da loja do carrinho (ou null)
  getLojaId(): number | null {
    const items = this.getCart();
    return items.length ? items[0].idLoja : null;
  }
}*/

// src/app/services/carrinho.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Produto } from './produto.service';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';

export interface CartItem {
  produtoId: number;
  idLoja: number;
  nome: string;
  precoUnit: number;
  quantidade: number;
  foto?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly KEY_PREFIX = 'cefoods_cart_';
  private apiBase = `${environment.apiUrl}/carrinho`;

  constructor(private authService: AuthService, private http: HttpClient) { }

  private getStorageKey(): string {
    const usuario = this.authService.getUsuarioLogado();
    if (!usuario || !usuario.idUsuario) return this.KEY_PREFIX + 'anon';
    return this.KEY_PREFIX + usuario.idUsuario;
  }

  private readLocal(): CartItem[] {
    const raw = localStorage.getItem(this.getStorageKey());
    return raw ? JSON.parse(raw) : [];
  }
  private saveLocal(items: CartItem[]) {
    localStorage.setItem(this.getStorageKey(), JSON.stringify(items));
  }
  clearLocal() { localStorage.removeItem(this.getStorageKey()); }

  private getUserId(): number | null {
    const u = this.authService.getUsuarioLogado();
    return u ? u.idUsuario : null;
  }

  // retorna a lista atual — Promise para unificar async/sync
  async getCart(): Promise<CartItem[]> {
    const userId = this.getUserId();
    if (!userId) {
      return this.readLocal();
    }
    try {
      const dto: any = await firstValueFrom(this.http.get<any>(`${this.apiBase}/${userId}`));
      return (dto.itens || []).map((i: any) => ({
        produtoId: i.produtoId,
        idLoja: dto.idLoja, // usa idLoja do DTO de carrinho
        nome: i.nome,
        precoUnit: i.precoUnit,
        quantidade: i.quantidade,
        foto: i.foto
      }));
    } catch (err) {
      console.error('Erro ao carregar carrinho via API, fallback local', err);
      return this.readLocal();
    }
  }

  // extrai o idLoja do objeto produto (várias formas possíveis)
  private produtoToLojaId(produto: Produto | any): number | null {
    if (!produto) return null;
    if ((produto as any).idLoja) return Number((produto as any).idLoja);
    if (produto.loja && (produto.loja.idLoja || produto.loja.id)) return Number(produto.loja.idLoja ?? produto.loja.id);
    // algumas APIs usam id instead of idLoja
    if ((produto as any).lojaId) return Number((produto as any).lojaId);
    return null;
  }

  // valida se pode adicionar
  async canAddProduct(produto: Produto | any, quantidade: number): Promise<{ ok: boolean; message?: string }> {
    if (!produto) return { ok: false, message: 'Produto inválido' };
    if (produto.disponivel === false) return { ok: false, message: 'Produto indisponível' };
    if (quantidade < 1) return { ok: false, message: 'Quantidade inválida' };

    const estoque = produto.estoque ?? produto.quant ?? 0;
    if (quantidade > estoque) {
      return { ok: false, message: `Estoque insuficiente (máx ${estoque})` };
    }

    const items = await this.getCart();
    if (items.length > 0) {
      const lojaIdCarrinho = items[0].idLoja;
      const lojaIdProduto = this.produtoToLojaId(produto);
      if (lojaIdProduto == null) {
        // tenta carregar produto do servidor para obter loja
        try {
          const id = produto.idProduto ?? produto.id;
          if (id) {
            const p: any = await firstValueFrom(this.http.get(`${environment.apiUrl}/produtos/${id}`));
            const lojaIdFromApi = this.produtoToLojaId(p);
            if (lojaIdFromApi == null) {
              return { ok: false, message: 'Não foi possível determinar a loja do produto' };
            }
            if (lojaIdFromApi !== lojaIdCarrinho) {
              return { ok: false, message: 'O carrinho já contém itens de outra loja. Finalize ou esvazie o carrinho.' };
            }
          } else {
            return { ok: false, message: 'Não foi possível determinar a loja do produto' };
          }
        } catch (err) {
          return { ok: false, message: 'Erro ao validar produto' };
        }
      } else {
        if (Number(lojaIdProduto) !== Number(lojaIdCarrinho)) {
          return { ok: false, message: 'O carrinho já contém itens de outra loja. Finalize ou esvazie o carrinho.' };
        }
      }
    }
    return { ok: true };
  }

  async getTotal(): Promise<number> {
    const items = await this.getCart();
    return items.reduce((acc, it) => acc + it.precoUnit * it.quantidade, 0);
  }

  getLojaId(): number | null {
    const u = this.getUserId();
    if (!u) {
      const items = this.readLocal();
      return items.length ? items[0].idLoja : null;
    }
    // se usuário logado, componentes devem chamar getCart() para obter loja
    return null;
  }

  async addProduct(produto: Produto | any, quantidade: number): Promise<void> {
    const userId = this.getUserId();
    if (!userId) {
      const items = this.readLocal();
      const existing = items.find(i => i.produtoId === (produto.idProduto ?? produto.id));
      if (existing) {
        existing.quantidade += quantidade;
      } else {
        items.push({
          produtoId: produto.idProduto ?? produto.id,
          idLoja: this.produtoToLojaId(produto) ?? 0,
          nome: produto.nome,
          precoUnit: produto.preco,
          quantidade,
          foto: produto.foto || produto.imagem || ''
        });
      }
      this.saveLocal(items);
      return;
    }
    // API: envia e espera o DTO atualizado (ou trata erro)
    const body = { produtoId: produto.idProduto ?? produto.id, quantidade };
    await firstValueFrom(this.http.post(`${this.apiBase}/${userId}/items`, body));
    // Não precisa retornar; componentes chamarão getCart() para atualizar view
  }

  async removeProduct(produtoId: number): Promise<void> {
    const userId = this.getUserId();
    if (!userId) {
      let items = this.readLocal();
      items = items.filter(i => i.produtoId !== produtoId);
      this.saveLocal(items);
      return;
    }
    await firstValueFrom(this.http.delete(`${this.apiBase}/${userId}/items/${produtoId}`));
  }

  async updateQuantity(produtoId: number, quantidade: number): Promise<void> {
    const userId = this.getUserId();
    if (!userId) {
      const items = this.readLocal();
      const el = items.find(i => i.produtoId === produtoId);
      if (!el) return;
      if (quantidade <= 0) {
        await this.removeProduct(produtoId);
      } else {
        el.quantidade = quantidade;
        this.saveLocal(items);
      }
      return;
    }
    await firstValueFrom(this.http.put(`${this.apiBase}/${userId}/items/${produtoId}`, quantidade));
  }

  async clearCart(): Promise<void> {
    const userId = this.getUserId();
    if (!userId) {
      this.clearLocal();
      return;
    }
    await firstValueFrom(this.http.delete(`${this.apiBase}/${userId}/clear`));
  }

  async checkout(formaPagamento: string, horarioRetirada: string): Promise<{ success: boolean; idPedido?: number; message?: string }> {
    const userId = this.getUserId();
    if (!userId) throw new Error('Faça login para finalizar pedido');

    const body = { formaPagamento, horarioRetirada };
    const resp: any = await firstValueFrom(this.http.post(`${this.apiBase}/${userId}/checkout`, body));
    return { success: resp.success, idPedido: resp.idPedido, message: resp.message };
  }
}



