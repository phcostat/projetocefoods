import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotaService } from 'src/app/services/nota.service';
import { AuthService } from 'src/app/services/auth.service';
import { LojaService } from 'src/app/services/loja.service';
import { AlertController, NavController } from '@ionic/angular';
import * as saveAs from 'file-saver';

@Component({
  selector: 'app-cadastrar-nota',
  templateUrl: './cadastrar-nota.page.html',
  styleUrls: ['./cadastrar-nota.page.scss'],
  standalone: false
})
export class CadastrarNotaPage {
  idNota?: number;   // <-- ID da nota (se edição)
  titulo = '';
  texto = '';
  arquivos: File[] = [];
  idLoja?: number;
  modoEdicao = false;
  notaExistente: any; // guardamos nota carregada

  constructor(
    private route: ActivatedRoute,
    private notaService: NotaService,
    private auth: AuthService,
    private lojaService: LojaService,
    private router: Router,
    private alertCtrl: AlertController,
    private navCtrl: NavController
  ) { }

  async ionViewWillEnter() {
    const usuario = this.auth.getUsuarioLogado();
    if (!usuario) return;

    // Descobre a loja do usuário
    const loja = await this.lojaService.getByUsuario(usuario.idUsuario).toPromise().catch(() => null);
    if (loja) this.idLoja = loja.idLoja;

    // Verifica se há ID na rota (edição)
    this.idNota = Number(this.route.snapshot.paramMap.get('id'));
    if (this.idNota) {
      this.modoEdicao = true;
      this.carregarNota(this.idNota);
    }
  }

  /*carregarNota(id: number) {
    this.notaService.getNotaPorId(id).subscribe(nota => {
      this.titulo = nota.titulo;
      this.texto = nota.texto;
      // anexos já existentes não recarregamos como File[], apenas exibimos se quiser depois
    });
  }*/

  onFilesSelected(event: any) {
    const files: FileList = event.target.files;
    for (let i = 0; i < files.length; i++) {
      this.arquivos.push(files.item(i)!);
    }
  }

  removerArquivo(idx: number) {
    this.arquivos.splice(idx, 1);
  }

  async salvar() {
    const usuario = this.auth.getUsuarioLogado();
    if (!usuario || !this.idLoja) return;

    try {
      if (this.modoEdicao && this.idNota) {
        await this.notaService.editarNota(this.idNota, this.titulo, this.texto, this.arquivos).toPromise();
        const a = await this.alertCtrl.create({ header: 'Atualizado', message: 'Nota atualizada com sucesso', buttons: ['OK'] });
        await a.present();
      } else {
        await this.notaService.criarNota(this.titulo, this.texto, usuario.idUsuario, this.idLoja, this.arquivos);
        const a = await this.alertCtrl.create({ header: 'Salvo', message: 'Nota salva com sucesso', buttons: ['OK'] });
        await a.present();
      }

      this.router.navigate(['/lista-notas']);
    } catch (err) {
      console.error(err);
      const a = await this.alertCtrl.create({ header: 'Erro', message: 'Não foi possível salvar a nota', buttons: ['OK'] });
      await a.present();
    }

  }

  carregarNota(id: number) {
    this.notaService.getNotaPorId(id).subscribe(nota => {
      this.titulo = nota.titulo;
      this.texto = nota.texto;
      this.notaExistente = nota; // salva nota completa p/ exibir anexos
    });
  }

  async baixarAnexoExistente(a: any) {
    try {
      const blob = await this.notaService.downloadAnexo(this.idNota!, a.idAnexo);
      saveAs(blob, a.nomeArquivo);
    } catch (err) {
      console.error("Erro ao baixar anexo", err);
    }
  }

  voltar() {
    this.navCtrl.back();
  }
}
