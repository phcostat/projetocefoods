export interface Notificacao {
  id: number;
  tipo: string;
  titulo?: string;
  mensagem?: string;
  lida?: boolean;
  pedidoId?: number;
  produtoId?: number;
  dataCriacao?: string;
}
