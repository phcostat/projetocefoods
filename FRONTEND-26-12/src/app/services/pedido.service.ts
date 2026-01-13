// src/app/services/pedido.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ProdutoService } from './produto.service';

export interface PedidoItem {
  idPedido: number;
  idProduto: number;
  nomeProduto: string;   // 🔹 novo campo vindo do backend
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface Pedido {
  idPedido: number;
  idUsuario?: number;
  idLoja?: number;
  nomeCliente?: string;
  chavePixLoja?: string;
  formaPagamento?: string;
  total?: number;
  valorTotal?: number;   // 🔹 agora reconhece o campo enviado no DTO
  status?: string;
  dataPedido?: string;
  horarioRetirada?: string;
  itens?: PedidoItem[];
}


@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private readonly KEY_GLOBAL = 'cefoods_pedidos';
  private readonly API = `${environment.apiUrl}/pedidos`;

  constructor(
    private http: HttpClient,
    private produtoService: ProdutoService
  ) { }

  // ---------------------------
  // Consultas (via API)
  // ---------------------------
  getPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.API);
  }

  getPedidosPorUsuario(idUsuario: number): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.API}/usuario/${idUsuario}`);
  }

  getPedidosPorLoja(idLoja: number): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.API}/loja/${idLoja}`);
  }

  // ---------------------------
  // Cadastro
  // ---------------------------
  addPedido(pedido: Pedido): Observable<Pedido> {
    return this.http.post<Pedido>(this.API, pedido);
  }

  // ---------------------------
  // Atualização
  // ---------------------------
  updatePedido(pedidoAtualizado: Pedido): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.API}/${pedidoAtualizado.idPedido}`, pedidoAtualizado);
  }

  // ---------------------------
  // Cancelamento (devolve estoque + muda status)
  // ---------------------------
  /*async cancelarPedido(pedido: Pedido) {
    // devolve estoque antes de cancelar
    for (const item of pedido.itens || []) {
      try {
        const produto = await firstValueFrom(this.produtoService.getById(item.idProduto));
        if (produto) {
          const produtoAtualizado = {
            ...produto,
            estoque: (produto.estoque ?? 0) + item.quantidade
          };
          await firstValueFrom(this.produtoService.update(produto.idProduto, produtoAtualizado));
        }
      } catch (error) {
        console.error('Erro ao devolver estoque do produto', error);
      }
    }

    // atualiza status via API
    pedido.status = 'CANCELLED';
    return firstValueFrom(this.http.put<Pedido>(`${this.API}/${pedido.idPedido}/status`, { status: 'CANCELLED' }));
  }*/
  /*async cancelarPedido(pedido: Pedido) {
    for (const item of pedido.itens || []) {
      try {
        const produto = await firstValueFrom(this.produtoService.getById(item.idProduto));
        console.log('Produto retornado do backend:', produto);

        if (produto && produto.idProduto) {
          const produtoAtualizado = {
            idProduto: produto.idProduto, // ⚠️ IMPORTANTE
            nome: produto.nome,
            descricao: produto.descricao,
            preco: produto.preco,
            imagem: produto.imagem,
            estoque: (produto.estoque ?? 0) + item.quantidade,
            estoqueMinimo: produto.estoqueMinimo,
            disponivel: produto.disponivel,
            categoria: produto.categoria ? { idCategoria: produto.categoria.idCategoria } : null,
            loja: produto.loja ? { idLoja: produto.loja.idLoja } : null
          };

          await firstValueFrom(this.produtoService.update(produto.idProduto, produtoAtualizado));
        } else {
          console.warn('Produto inválido ou sem idProduto:', produto);
        }
      } catch (error) {
        console.error('Erro ao devolver estoque do produto', error);
      }
    }

    pedido.status = 'CANCELLED';
    return firstValueFrom(
      this.http.put<Pedido>(`${this.API}/${pedido.idPedido}/status`, { status: 'CANCELLED' })
    );
  }*/


  // Cancela (recusa) um pedido: apenas chama o endpoint de status.
  // Enviamos 'RECUSADO' (o backend aceita 'RECUSADO' e também 'CANCELLED')
  cancelarPedido(pedido: Pedido): Promise<any> {
    const url = `${this.API}/${pedido.idPedido}/status`;
    // enviamos um body simples com 'status'
    return firstValueFrom(this.http.put(url, { status: 'RECUSADO' }));
  }

  // método genérico de atualizar status (útil)
  atualizarStatus(idPedido: number, status: string): Promise<any> {
    const url = `${this.API}/${idPedido}/status`;
    return firstValueFrom(this.http.put(url, { status }));
  }

  // ---------------------------
  // Alterar status
  // ---------------------------
  aceitarPedido(pedido: Pedido): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.API}/${pedido.idPedido}/status`, { status: 'ACCEPTED' });
  }

  concluirPedido(pedido: Pedido): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.API}/${pedido.idPedido}/status`, { status: 'COMPLETED' });
  }
}
