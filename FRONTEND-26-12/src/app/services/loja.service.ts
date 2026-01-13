// src/app/services/loja.service.ts
/*import { Injectable } from '@angular/core';

export interface HorarioFuncionamento {
  [dia: string]: { manha: boolean; tarde: boolean; noite: boolean };
}

export interface Loja {
  id: number;
  idUsuario: number;
  nomeFantasia: string;
  descricao: string;
  fotoCapa: string;
  localizacao: string;
  status: boolean; // aberta ou fechada
  aceitaPix: boolean;
  aceitaDinheiro: boolean;
  aceitaCartao: boolean;
  dataCriacao: string;
  qtdProdutosVendidos: number;
  avaliacaoMedia: number;
  totalPedidos: number;
  horarioFuncionamento: HorarioFuncionamento;
}

@Injectable({
  providedIn: 'root'
})
export class LojaService {
  private readonly KEY = 'cefoods_lojas';

  constructor() {}

  private readAll(): Loja[] {
    const raw = localStorage.getItem(this.KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as Loja[];
    } catch {
      return [];
    }
  }

  private saveAll(lojas: Loja[]) {
    localStorage.setItem(this.KEY, JSON.stringify(lojas));
  }

  getAll(): Loja[] {
    return this.readAll();
  }

  getById(id: number): Loja | undefined {
    return this.readAll().find(l => l.id === id);
  }

  getByUsuario(idUsuario: number): Loja | undefined {
    return this.readAll().find(l => l.idUsuario === idUsuario);
  }

  create(loja: Partial<Loja>): Loja {
    const lojas = this.readAll();
    const novaLoja: Loja = {
      id: Date.now(),
      idUsuario: loja.idUsuario!,
      nomeFantasia: loja.nomeFantasia || 'Nova Loja',
      descricao: loja.descricao || '',
      fotoCapa: loja.fotoCapa || '',
      localizacao: loja.localizacao || '',
      status: loja.status ?? true,
      aceitaPix: loja.aceitaPix ?? false,
      aceitaDinheiro: loja.aceitaDinheiro ?? false,
      aceitaCartao: loja.aceitaCartao ?? false,
      dataCriacao: new Date().toISOString(),
      qtdProdutosVendidos: 0,
      avaliacaoMedia: 0,
      totalPedidos: 0,
      horarioFuncionamento: loja.horarioFuncionamento || this.getHorarioPadrao()
    };
    lojas.push(novaLoja);
    this.saveAll(lojas);
    return novaLoja;
  }

  update(updated: Loja): Loja {
    const lojas = this.readAll();
    const idx = lojas.findIndex(l => l.id === updated.id);
    if (idx !== -1) {
      lojas[idx] = { ...lojas[idx], ...updated };
      this.saveAll(lojas);
      return lojas[idx];
    }
    throw new Error('Loja não encontrada');
  }

  delete(id: number): void {
    let lojas = this.readAll();
    lojas = lojas.filter(l => l.id !== id);
    this.saveAll(lojas);
  }

  getHorarioPadrao(): HorarioFuncionamento {
    return {
      segunda: { manha: false, tarde: false, noite: false },
      terca: { manha: false, tarde: false, noite: false },
      quarta: { manha: false, tarde: false, noite: false },
      quinta: { manha: false, tarde: false, noite: false },
      sexta: { manha: false, tarde: false, noite: false },
      sabado: { manha: false, tarde: false, noite: false },
      domingo: { manha: false, tarde: false, noite: false }
    };
  }
}*/

// src/app/services/loja.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export type LojaStatusAdministrativo = 'ATIVA' | 'EM_ANALISE' | 'SUSPENSA';

export interface HorarioDTO {
  diaSemana: string;
  turno: string;
}

export interface Loja {
  idLoja: number;
  idUsuario: number;
  nomeFantasia: string;
  descricao?: string;
  fotoCapa?: string;
  localizacao?: string;
  status: boolean;
  statusAdm: LojaStatusAdministrativo;
  manualOverride?: boolean;
  visivel?: boolean;
  aceitaPix: boolean;
  aceitaDinheiro: boolean;
  aceitaCartao: boolean;
  dataCriacao?: string;
  qtdProdutosVendidos?: number;
  avaliacaoMedia?: number;
  totalPedidos?: number;
  usuario: { idUsuario: number; nome: string; email: string; login: string; };
  horarios?: HorarioDTO[];
}

export interface CreateLojaReq {
  idUsuario: number;
  nomeFantasia: string;
  descricao?: string;
  fotoCapa?: string;
  localizacao?: string;
  status?: boolean;
  visivel?: boolean;
  aceitaPix?: boolean;
  aceitaDinheiro?: boolean;
  aceitaCartao?: boolean;
  statusAdm?: LojaStatusAdministrativo;
  horariosFuncionamento?: HorarioDTO[];
}

export interface UpdateLojaStatusReq {
  status: boolean;
  manualOverride?: boolean;
}


export interface UpdateLojaReq {
  nomeFantasia?: string;
  descricao?: string;
  fotoCapa?: string;
  localizacao?: string;
  status?: boolean;
  visivel?: boolean;
  aceitaPix?: boolean;
  aceitaDinheiro?: boolean;
  aceitaCartao?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LojaService {
  private baseUrl = `${environment.apiUrl}/lojas`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<Loja[]> {
    return this.http.get<Loja[]>(this.baseUrl);
  }

  getByUsuario(idUsuario: number): Observable<Loja | undefined> {
    return this.http.get<Loja[]>(`${this.baseUrl}/usuario/${idUsuario}`).pipe(
      map(lojas => lojas.length > 0 ? lojas[0] : undefined),
      catchError(err => {
        console.error('LojaService.getByUsuario failed', err);
        // fallback to undefined so callers handle "no loja"
        return of(undefined);
      })
    );
  }


  getById(idLoja: number): Observable<Loja> {
    return this.http.get<Loja>(`${this.baseUrl}/${idLoja}`).pipe(
      catchError(err => {
        console.error(`LojaService.getById ${idLoja} failed`, err);
        // return a minimal fallback Loja so UI can continue showing product cards
        const fallback: Loja = {
          idLoja,
          idUsuario: 0,
          nomeFantasia: 'Loja',
          descricao: '',
          fotoCapa: undefined,
          localizacao: undefined,
          status: true,
          statusAdm: 'ATIVA',
          manualOverride: false,
          visivel: true,
          aceitaPix: false,
          aceitaDinheiro: false,
          aceitaCartao: false,
          usuario: { idUsuario: 0, nome: '', email: '', login: '' }
        };
        return of(fallback);
      })
    );
  }

  create(dto: CreateLojaReq): Observable<Loja> {
    return this.http.post<Loja>(this.baseUrl, dto);
  }

  update(idLoja: number, dto: UpdateLojaReq): Observable<Loja> {
    return this.http.put<Loja>(`${this.baseUrl}/${idLoja}`, dto);
  }

  updateHorarios(idLoja: number, horarios: HorarioDTO[]): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${idLoja}/horarios`, horarios);
  }

  updateStatus(idLoja: number, dto: UpdateLojaStatusReq): Observable<Loja> {
    return this.http.patch<Loja>(`${this.baseUrl}/${idLoja}/status`, dto);
  }


  delete(idLoja: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${idLoja}`);
  }

  uploadFotoCapa(idLoja: number, arquivo: File): Observable<Loja> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    return this.http.post<Loja>(`${this.baseUrl}/${idLoja}/foto-capa`, formData);
  }
}

