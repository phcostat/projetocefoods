// src/app/services/avaliacao.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Avaliacao {
  id?: number;
  estrelas: number;
  data?: string;
  produto?: any;
  usuario?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AvaliacaoService {
  private readonly API = 'http://localhost:8080/avaliacoes'; // ajuste se necessário

  constructor(private http: HttpClient) {}

  // Cria ou atualiza avaliação
  avaliar(idProduto: number, idUsuario: number, estrelas: number): Observable<Avaliacao> {
    return this.http.post<Avaliacao>(`${this.API}`, { idProduto, idUsuario, estrelas });
  }

  // Lista todas avaliações de um produto
  listarPorProduto(idProduto: number): Observable<Avaliacao[]> {
    return this.http.get<Avaliacao[]>(`${this.API}/produto/${idProduto}`);
  }
}
