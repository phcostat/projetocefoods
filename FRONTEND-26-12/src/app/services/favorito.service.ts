import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Produto } from './produto.service';

export interface FavoritoPayload {
  idUsuario: number;
  idProduto: number;
}

export interface FavoritoResponse {
  idUsuario: number;
  idProduto: number;
  dataFavorito: string;
  produto: Produto;
}

@Injectable({ providedIn: 'root' })
export class FavoritoService {
  private apiUrl = `${environment.apiUrl}/favoritos`;

  constructor(private http: HttpClient) {}

  listarPorUsuario(idUsuario: number): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${this.apiUrl}/usuario/${idUsuario}`);
  }

  verificar(idUsuario: number, idProduto: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/usuario/${idUsuario}/produto/${idProduto}`);
  }

  adicionar(payload: FavoritoPayload): Observable<FavoritoResponse> {
    return this.http.post<FavoritoResponse>(this.apiUrl, payload);
  }

  remover(idUsuario: number, idProduto: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/usuario/${idUsuario}/produto/${idProduto}`);
  }
}
