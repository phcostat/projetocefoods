import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotaService } from 'src/app/services/nota.service';
import { DomSanitizer } from '@angular/platform-browser';
import { saveAs } from 'file-saver'; // opcional: instalar file-saver (npm i file-saver)
import { AlertController } from '@ionic/angular';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-anotacao',
  templateUrl: './anotacao.page.html',
  styleUrls: ['./anotacao.page.scss'],
  standalone:false
})
export class AnotacaoPage implements OnInit {
  nota: any;

  constructor(
    private route: ActivatedRoute,
    private notaService: NotaService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private alertCtrl: AlertController,
    private navCtrl: NavController  
  ) {}

  async ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;
    this.nota = await this.notaService.getById(id);
  }

  async baixar(anexo: any) {
    try {
      const blob = await this.notaService.downloadAnexo(this.nota.idNota, anexo.idAnexo);
      // usar FileSaver para salvar
      saveAs(blob, anexo.nomeArquivo);
    } catch (err) {
      console.error(err);
      const a = await this.alertCtrl.create({ header: 'Erro', message: 'Falha ao baixar anexo', buttons: ['OK']});
      await a.present();
    }
  }

  async deletarNota() {
    const a = await this.alertCtrl.create({
      header: 'Confirmar',
      message: 'Deseja excluir esta nota?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Sim', handler: async () => {
            try {
              await this.notaService.deletarNota(this.nota.idNota);
              this.router.navigate(['/notas']);
            } catch (err) {
              console.error(err);
            }
        } }
      ]
    });
    await a.present();
  }

  voltar() {
    this.navCtrl.back();
  }
}
