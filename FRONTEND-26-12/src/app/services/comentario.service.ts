import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Comentario {
  id: number;
  texto: string;
  data: string; // ISO String (LocalDateTime)
  nomeUsuario?: string;
  fotoUsuario?: string;
  usuario?: {
    idUsuario: number;
    nome: string;
    sobrenome?: string;
    email: string;
    foto?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ComentarioService {
  private apiUrl = 'http://localhost:8080/comentarios'; // ajuste se precisar

  constructor(private http: HttpClient) {}

  listarPorProduto(idProduto: number): Observable<Comentario[]> {
    return this.http.get<Comentario[]>(`${this.apiUrl}/produto/${idProduto}`);
  }

  criarComentario(payload: { texto: string; idProduto: number; idUsuario: number }): Observable<Comentario> {
    return this.http.post<Comentario>(this.apiUrl, payload);
  }
}
