import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AdminDataService } from '../../../services/admin-data.service';
import { AdminComentario, AdminProduto, AdminSummary } from '../admin.types';

interface QuickLink {
  title: string;
  description: string;
  icon: string;
  route: string;
  accent: string;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class AdminDashboardPage {
  readonly summary$: Observable<AdminSummary> = this.adminData.summary$;
  readonly atividades$ = this.adminData.activities$;

  readonly comentariosPendentes$: Observable<AdminComentario[]> = this.adminData.comentarios$.pipe(
    map(comentarios => comentarios.filter(comentario => comentario.status === 'pendente'))
  );

  readonly produtosCriticos$: Observable<AdminProduto[]> = this.adminData.produtos$.pipe(
    map(produtos =>
      [...produtos]
        .filter(produto => produto.estoque <= 10)
        .sort((a, b) => a.estoque - b.estoque)
        .slice(0, 4)
    )
  );

  readonly quickLinks: QuickLink[] = [
    {
      title: 'Usuarios',
      description: 'Perfis, resets de senha e auditoria granular.',
      icon: 'people-outline',
      route: '/admin/usuarios',
      accent: '#ffd35c'
    },
    {
      title: 'Lojas',
      description: 'Homologacoes, faturamento e planos ativos.',
      icon: 'storefront-outline',
      route: '/admin/lojas',
      accent: '#9ef0ff'
    },
    {
      title: 'Produtos',
      description: 'Estoque, destaques e faixas de preco dinamicas.',
      icon: 'cube-outline',
      route: '/admin/produtos',
      accent: '#ffc2dd'
    },
    {
      title: 'Comentarios',
      description: 'Avaliacoes com curadoria e respostas publicas.',
      icon: 'chatbubbles-outline',
      route: '/admin/comentarios',
      accent: '#d3f36b'
    }
  ];

  constructor(private adminData: AdminDataService) {}
}

