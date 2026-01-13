// src/app/services/produto.service.ts
/*import { Injectable } from '@angular/core';

export interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  tipo: string;
  categoria: string;
  quant: number;
  disponivel: boolean;
  foto?: string;
  idLoja: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {
  private readonly KEY = 'cefoods_produtos';

  constructor() { }

  private readAll(): Produto[] {
    const raw = localStorage.getItem(this.KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private saveAll(produtos: Produto[]) {
    localStorage.setItem(this.KEY, JSON.stringify(produtos));
  }

  getAll(): Produto[] {
    return this.readAll();
  }

  getById(id: number): Produto | undefined {
    return this.readAll().find(p => p.id === id);
  }

  getByLoja(idLoja: number): Produto[] {
    return this.readAll().filter(p => p.idLoja === idLoja);
  }

  getAllDisponiveis(): Produto[] {
    return this.readAll().filter(p => p.disponivel && p.quant > 0);
  }

  create(produto: Partial<Produto>): Produto {
    const produtos = this.readAll();
    const newProduto: Produto = {
      id: Date.now(),
      nome: produto.nome || 'Produto sem nome',
      descricao: produto.descricao || '',
      preco: produto.preco || 0,
      tipo: produto.tipo || '',
      categoria: produto.categoria || '',
      quant: produto.quant || 0,
      disponivel: produto.disponivel ?? true,
      foto: produto.foto || '',
      idLoja: produto.idLoja!
    };
    produtos.push(newProduto);
    this.saveAll(produtos);
    return newProduto;
  }

  update(updated: Produto): Produto {
    const produtos = this.readAll();
    const idx = produtos.findIndex(p => p.id === updated.id);
    if (idx !== -1) {
      produtos[idx] = { ...produtos[idx], ...updated };
      this.saveAll(produtos);
      return produtos[idx];
    }
    throw new Error('Produto não encontrado');
  }


  delete(id: number): void {
    let produtos = this.readAll();
    produtos = produtos.filter(p => p.id !== id);
    this.saveAll(produtos);
  }

  getProdutos(): Produto[] {
  const raw = localStorage.getItem('cefoods_produtos');
  return raw ? JSON.parse(raw) : [];
}

}*/





// src/app/services/produto.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Produto {
  idProduto: number;
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
  estoque: number;
  estoqueMinimo: number;
  disponivel: boolean;
  foto: string;
  loja: {
    idLoja: number;
    nomeFantasia: string;
    descricao: string;
  };
  categoria: {
    idCategoria: number;
    nome: string;
    descricao: string;
  };
}

export interface Produto {
  idProduto: number;
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
  estoque: number;
  estoqueMinimo: number;
  disponivel: boolean;
  foto: string;
  idLoja: number;
  idCategoria: number;
  avaliacaoMedia?: number; // <-- vem do backend
  // usados pelo frontend
  mediaAvaliacao?: number;
  mediaAvaliacaoInt?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {
  private apiUrl = `${environment.apiUrl}/produtos`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.apiUrl);
  }

  getById(id: number): Observable<Produto> {
    return this.http.get<Produto>(`${this.apiUrl}/${id}`);
  }

  getByLoja(idLoja: number): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${this.apiUrl}/loja/${idLoja}`);
  }

  getByCategoria(idCategoria: number): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${this.apiUrl}/categoria/${idCategoria}`);
  }

  create(produto: Partial<Produto>): Observable<Produto> {
    return this.http.post<Produto>(this.apiUrl, produto);
  }

  update(id: number, produto: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, produto);
  }


  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // src/app/services/produto.service.ts
  getAllDisponiveis(): Promise<Produto[]> {
    return firstValueFrom(
      this.http.get<Produto[]>(`${this.apiUrl}?disponivel=true`)
    );
  }

  uploadImagem(idProduto: number, arquivo: File): Observable<Produto> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    return this.http.post<Produto>(`${this.apiUrl}/${idProduto}/imagem`, formData);
  }

}
