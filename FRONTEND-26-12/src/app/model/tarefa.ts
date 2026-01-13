import { Tipo } from "./tipo";

export class Tarefa {
  id: number;
  descricao: string;
  data: string;
  tipo: Tipo;

  constructor() {
    this.id = 0;
    this.descricao = "";
    this.data = new Date().toISOString();
    this.tipo = new Tipo();
  }
}

