import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FinanceiroSnapshot } from './financeiro-relatorio-bridge.service';

export type TipoPeriodo = 'SEMANAL' | 'MENSAL';

export interface Relatorio {
  idRelatorio: number;
  idLoja: number;
  tipoPeriodo: TipoPeriodo;
  dataInicio: string;
  dataFim: string;
  receitaTotal: number;
  ticketMedio: number;
  pedidosRecebidos: number;
  pedidosAceitos: number;
  pedidosRecusados: number;
  itensVendidos: number;
  taxaConversao: number;
  arquivoUrl?: string;
  status: string;
  criadoEm: string;
}

export interface CriarRelatorioPayload {
  idLoja: number;
  tipoPeriodo: TipoPeriodo;
  dataInicio?: string;
  dataFim?: string;
  resumoFinanceiro?: FinanceiroSnapshot | null;
}

@Injectable({ providedIn: 'root' })
export class RelatorioService {
  private readonly api = `${environment.apiUrl}/relatorios`;

  constructor(private http: HttpClient) {}

  listarPorLoja(idLoja: number): Observable<Relatorio[]> {
    return this.http.get<Relatorio[]>(`${this.api}/loja/${idLoja}`);
  }

  criar(payload: CriarRelatorioPayload): Observable<Relatorio> {
    return this.http.post<Relatorio>(this.api, payload);
  }

  download(idRelatorio: number): Observable<Blob> {
    return this.http.get(`${this.api}/${idRelatorio}/arquivo`, { responseType: 'blob' });
  }
}
