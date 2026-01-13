import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, firstValueFrom } from 'rxjs';
import { Nota } from 'src/app/model/nota';

@Injectable({
  providedIn: 'root'
})
export class NotaService {
  private API = `${environment.apiUrl}/notas`;

  constructor(private http: HttpClient) { }

  listarPorLoja(idLoja: number): Promise<Nota[]> {
    return firstValueFrom(this.http.get<Nota[]>(`${this.API}/loja/${idLoja}`));
  }

  getById(idNota: number): Promise<Nota> {
    return firstValueFrom(this.http.get<Nota>(`${this.API}/${idNota}`));
  }

  getNotaPorId(id: number) {
    return this.http.get<any>(`${this.API}/${id}`);
  }


  async criarNota(titulo: string, texto: string, idUsuario: number, idLoja: number, arquivos: File[] = []): Promise<Nota> {
    const fd = new FormData();
    fd.append('titulo', titulo);
    if (texto) fd.append('texto', texto);
    fd.append('idUsuario', String(idUsuario));
    fd.append('idLoja', String(idLoja));
    for (const f of arquivos) {
      fd.append('anexos', f, f.name);
    }
    return firstValueFrom(this.http.post<Nota>(this.API, fd));
  }

  /*deletarNota(idNota: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.API}/${idNota}`));
  }*/

  editarNota(id: number, titulo: string, texto: string, arquivos: File[]) {
    const formData = new FormData();
    if (titulo) formData.append("titulo", titulo);
    if (texto) formData.append("texto", texto);
    arquivos.forEach(f => formData.append("anexos", f));
    return this.http.put<any>(`${this.API}/${id}`, formData);
  }



  deletarNota(id: number) {
    return this.http.delete(`${this.API}/${id}`);
  }


  downloadAnexo(idNota: number, idAnexo: number): Promise<Blob> {
    return firstValueFrom(this.http.get(`${this.API}/${idNota}/anexos/${idAnexo}`, { responseType: 'blob' }));
  }
}
