import { Component, OnInit } from '@angular/core';
import { NotaService } from 'src/app/services/nota.service';
import { AuthService } from 'src/app/services/auth.service';
import { LojaService } from 'src/app/services/loja.service';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-lista-notas',
  templateUrl: './lista-notas.page.html',
  styleUrls: ['./lista-notas.page.scss'],
  standalone: false
})
export class ListaNotasPage implements OnInit {
  notas: any[] = [];
  idLoja?: number;

  constructor(
    private notaService: NotaService,
    private auth: AuthService,
    private lojaService: LojaService,
    private router: Router,
    private navCtrl: NavController,
    private alertCtrl: AlertController
  ) { }

  async ngOnInit() {
    await this.load();
  }

  async ionViewWillEnter() {
    await this.load();
  }

  private async load() {
    const usuario = this.auth.getUsuarioLogado();
    if (!usuario) return;

    // busca loja do usuário (assumindo que já existe método)
    const loja = await this.lojaService.getByUsuario(usuario.idUsuario).toPromise().catch(() => null);
    if (!loja) {
      this.notas = [];
      return;
    }
    this.idLoja = loja.idLoja;
    this.notas = await this.notaService.listarPorLoja(this.idLoja);
  }

  abrirDetalhes(nota: any) {
    this.router.navigate(['/anotacao', nota.idNota]);
  }

  novo() {
    this.router.navigate(['/cadastrar-nota']);
  }

  voltar() {
    this.router.navigate(['/minha-loja']);
  }

  async editarNota(id: number) {
    this.router.navigate([`/cadastrar-nota/${id}`]); // leva para a tela de edição
  }

  async excluirNota(id: number) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmação',
      message: 'Deseja excluir esta nota?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          handler: () => {
            this.notaService.deletarNota(id).subscribe(() => {
              this.load(); // atualiza a lista
            });
          }
        }
      ]
    });
    await alert.present();
  }

}
