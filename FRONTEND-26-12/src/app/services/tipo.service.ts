import { Injectable } from '@angular/core';
import {Tipo} from '../model/tipo';

@Injectable({
  providedIn: 'root'
})
export class TipoService {

  constructor() { }

  salvar(tipo: Tipo): Tipo{
    let tipos = JSON.parse(localStorage.getItem('tipos') || '[]');
    if(tipo.id === 0){
      tipo.id = (new Date().getTime() / 1000) * Math.random(); //Gera um ID aleatório.
      tipos.push(tipo);
    }else{
      let posicao = tipos.findIndex((temp: Tipo) => temp.id === tipo.id);
      tipos[posicao] =  tipo;
    }
    localStorage.setItem('tipos', JSON.stringify(tipos));
    return tipo;
  }

  listar(): Tipo[]{
    let tipos = JSON.parse(localStorage.getItem('tipos') || '[]');
    return tipos;
  }

  buscarPorId(id: number): Tipo{
    let tipos = JSON.parse(localStorage.getItem('tipos') || '[]');
    let tipo = new Tipo();
    tipo = tipos.find((temp: Tipo) => temp.id === id);
    return tipo;
  }

  excluir(id: number): boolean{
    let tipos = JSON.parse(localStorage.getItem('tipos') || '[]');
    tipos = tipos.filter((temp: Tipo) => temp.id !== id);
    localStorage.setItem('tipos', JSON.stringify(tipos));
    return true;
  }
}

