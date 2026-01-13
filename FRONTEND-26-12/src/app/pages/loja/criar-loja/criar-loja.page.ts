/*import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { LojaService, HorarioFuncionamento, Loja } from 'src/app/services/loja.service';
import { AuthService } from 'src/app/services/auth.service';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-criar-loja',
  templateUrl: './criar-loja.page.html',
  styleUrls: ['./criar-loja.page.scss'],
  standalone: false
})
export class CriarLojaPage implements OnInit {
  lojaId?: number;
  editando = false;

  nomeFantasia = '';
  descricao = '';
  fotoCapa = '';
  fotoCapaPreview: string | null = null;
  fotoCapaArquivo: File | null = null;
  localizacao = '';
  status = true;
  aceitaPix = false;
  aceitaDinheiro = false;
  aceitaCartao = false;
  horarioFuncionamento: HorarioFuncionamento;

  constructor(
    private lojaService: LojaService,
    private authService: AuthService,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private location: Location,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.horarioFuncionamento = this.lojaService.getHorarioPadrao();
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.lojaId = Number(params['id']);
        const loja = this.lojaService.getById(this.lojaId);
        if (loja) {
          this.editando = true;
          this.preencherCampos(loja);
        }
      }
    });
  }

  preencherCampos(loja: Loja) {
    this.nomeFantasia = loja.nomeFantasia;
    this.descricao = loja.descricao || '';
    this.fotoCapa = loja.fotoCapa || '';
    this.fotoCapaPreview = loja.fotoCapa || null;
    this.localizacao = loja.localizacao || '';
    this.status = loja.status;
    this.aceitaPix = loja.aceitaPix || false;
    this.aceitaDinheiro = loja.aceitaDinheiro || false;
    this.aceitaCartao = loja.aceitaCartao || false;
    this.horarioFuncionamento = loja.horarioFuncionamento || this.lojaService.getHorarioPadrao();
  }

  toggleTurno(dia: string, turno: 'manha' | 'tarde' | 'noite') {
    this.horarioFuncionamento[dia][turno] = !this.horarioFuncionamento[dia][turno];
  }

  selecionarFotoCapa(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    if (!file) {
      return;
    }
    if (this.fotoCapaPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(this.fotoCapaPreview);
    }
    this.fotoCapaArquivo = file;
    this.fotoCapaPreview = URL.createObjectURL(file);
  }

  async salvar() {
    if (this.editando) {
      await this.atualizarLoja();
    } else {
      await this.criarLoja();
    }
  }

  async criarLoja() {
    if (!this.validarCampos()) return;

    const usuario = this.authService.getUsuarioLogado();
    if (!usuario) {
      await this.showAlert('Erro', 'Usuário não identificado. Faça login novamente.');
      return;
    }

    this.lojaService.create({
      idUsuario: usuario.idUsuario,
      nomeFantasia: this.nomeFantasia,
      descricao: this.descricao,
      fotoCapa: this.fotoCapa,
      localizacao: this.localizacao,
      status: this.status,
      aceitaPix: this.aceitaPix,
      aceitaDinheiro: this.aceitaDinheiro,
      aceitaCartao: this.aceitaCartao,
      horarioFuncionamento: this.horarioFuncionamento
    });

    usuario.possuiLoja = true;
    usuario.tipoPerfil = 'vendedor';
    this.authService.updateUsuario(usuario);

    await this.showAlert('Sucesso', 'Loja criada com sucesso!', true);
  }

  async atualizarLoja() {
    if (!this.validarCampos()) return;
    if (!this.lojaId) return;

    const loja = this.lojaService.getById(this.lojaId);
    if (!loja) {
      await this.showAlert('Erro', 'Loja não encontrada.');
      return;
    }

    loja.nomeFantasia = this.nomeFantasia;
    loja.descricao = this.descricao;
    loja.fotoCapa = this.fotoCapa;
    loja.localizacao = this.localizacao;
    loja.status = this.status;
    loja.aceitaPix = this.aceitaPix;
    loja.aceitaDinheiro = this.aceitaDinheiro;
    loja.aceitaCartao = this.aceitaCartao;
    loja.horarioFuncionamento = this.horarioFuncionamento;

    this.lojaService.update(loja);

    await this.showAlert('Sucesso', 'Loja atualizada com sucesso!', true);
  }

  validarCampos(): boolean {
    if (!this.nomeFantasia.trim()) {
      this.showAlert('Atenção', 'Informe o nome da loja.');
      return false;
    }
    return true;
  }

  async showAlert(header: string, message: string, redirect: boolean = false) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            if (redirect) {
              this.navCtrl.navigateRoot('/minha-loja');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  voltar() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/inicio']);
    }
  }
}*/

// src/app/pages/criar-loja/criar-loja.page.ts
// src/app/pages/criar-loja/criar-loja.page.ts

import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { LojaService, HorarioDTO, Loja } from 'src/app/services/loja.service';
import { AuthService } from 'src/app/services/auth.service';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-criar-loja',
  templateUrl: './criar-loja.page.html',
  styleUrls: ['./criar-loja.page.scss'],
  standalone: false
})
export class CriarLojaPage implements OnInit {
  lojaId?: number;
  editando = false;

  nomeFantasia = '';
  descricao = '';
  fotoCapa = '';
  fotoCapaPreview: string | null = null;
  fotoCapaArquivo: File | null = null;
  localizacao = '';
  status = true;
  aceitaPix = false;
  aceitaDinheiro = false;
  aceitaCartao = false;

  horarioFuncionamento: Record<string, { manha: boolean; tarde: boolean; noite: boolean }>;

  constructor(
    private lojaService: LojaService,
    private authService: AuthService,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private location: Location,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.horarioFuncionamento = this.getHorarioPadrao();
  }

  /*ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.lojaId = Number(params['id']);
        this.editando = true;
        this.lojaService.getById(this.lojaId).subscribe(loja => this.preencherCampos(loja));
      }
    });
  }

  preencherCampos(loja: Loja) {
    this.nomeFantasia = loja.nomeFantasia;
    this.descricao = loja.descricao || '';
    this.fotoCapa = loja.fotoCapa || '';
    this.fotoCapaPreview = loja.fotoCapa || null;
    this.localizacao = loja.localizacao || '';
    this.status = loja.status;
    this.aceitaPix = loja.aceitaPix;
    this.aceitaDinheiro = loja.aceitaDinheiro;
    this.aceitaCartao = loja.aceitaCartao;
    this.horarioFuncionamento = this.toHorarioMap(loja.horarios || []);
  }*/

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.lojaId = Number(params['id']);
        this.editando = true;
        this.lojaService.getById(this.lojaId).subscribe(loja => {
          console.log('Loja carregada para edição:', loja); // DEBUG
          this.preencherCampos(loja);
        });
      }
    });
  }

  preencherCampos(loja: Loja) {
    this.nomeFantasia = loja.nomeFantasia;
    this.descricao = loja.descricao || '';
    this.fotoCapa = loja.fotoCapa || '';
    this.localizacao = loja.localizacao || '';
    this.status = loja.status;
    this.aceitaPix = loja.aceitaPix;
    this.aceitaDinheiro = loja.aceitaDinheiro;
    this.aceitaCartao = loja.aceitaCartao;
    this.horarioFuncionamento = this.toHorarioMap(loja.horarios || []);
  }


  toggleTurno(dia: string, turno: 'manha' | 'tarde' | 'noite') {
    this.horarioFuncionamento[dia][turno] = !this.horarioFuncionamento[dia][turno];
  }

  selecionarFotoCapa(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    if (!file) {
      return;
    }
    if (this.fotoCapaPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(this.fotoCapaPreview);
    }
    this.fotoCapaArquivo = file;
    this.fotoCapaPreview = URL.createObjectURL(file);
  }

  async salvar() {
    if (!this.validarCampos()) {
      return;
    }

    const usuario = this.authService.getUsuarioLogado();
    if (!usuario) {
      await this.showAlert('Erro', 'Faça login novamente.');
      return;
    }

    // Log para debugar
    console.log('Usuário logado:', usuario);

    const payload: any = {
      idUsuario: usuario.idUsuario,
      nomeFantasia: this.nomeFantasia,
      descricao: this.descricao || null,
      fotoCapa: this.fotoCapa || null,
      localizacao: this.localizacao || null,
      status: this.status ? true : false,  // enviar boolean diretamente
      visivel: true,
      aceitaPix: this.aceitaPix,
      aceitaDinheiro: this.aceitaDinheiro,
      aceitaCartao: this.aceitaCartao,
      horariosFuncionamento: this.toHorarioDTOs(this.horarioFuncionamento)
    };

    console.log('Payload a enviar:', payload);

    if (this.editando && this.lojaId != null) {
      this.lojaService.update(this.lojaId, payload).subscribe(async () => {
        await this.enviarFotoCapaSeNecessario(this.lojaId!);
        this.showAlert('Sucesso', 'Loja atualizada!', true);
      });
    } else {
      this.lojaService.create(payload).subscribe(async loja => {
        usuario.possuiLoja = true;
        usuario.tipoPerfil = 'vendedor';

        this.authService.updateUsuario(usuario).then(async () => {
          await this.enviarFotoCapaSeNecessario(loja.idLoja);
          this.showAlert('Sucesso', 'Loja criada!', true);
          this.navCtrl.navigateRoot('/minha-loja');
        }).catch((err) => {
          console.error('Erro ao atualizar usuário após criação da loja:', err);
          this.showAlert('Erro', 'Loja criada, mas falha ao atualizar perfil do usuário.');
        });
      });
    }
  }

  private async enviarFotoCapaSeNecessario(idLoja: number): Promise<void> {
    if (!this.fotoCapaArquivo) {
      return;
    }
    try {
      const loja = await firstValueFrom(this.lojaService.uploadFotoCapa(idLoja, this.fotoCapaArquivo));
      if (this.fotoCapaPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(this.fotoCapaPreview);
      }
      this.fotoCapa = loja.fotoCapa || '';
      this.fotoCapaPreview = loja.fotoCapa || null;
      this.fotoCapaArquivo = null;
    } catch (error) {
      console.error('Erro ao enviar foto da loja', error);
      await this.showAlert('Aviso', 'Loja salva, mas ocorreu um erro ao enviar a foto.');
    }
  }


  /**
   * Converte a estrutura interna (mapa de dias/turnos) em lista de DTOs
   */
  private toHorarioDTOs(
    map: Record<string, { manha: boolean; tarde: boolean; noite: boolean }>
  ): HorarioDTO[] {
    return Object.entries(map).flatMap(([dia, turnos]: [string, { manha: boolean; tarde: boolean; noite: boolean }]) => {
      const diaStr = dia;

      const turnoKeys = Object.keys(turnos) as Array<keyof typeof turnos>;

      return turnoKeys
        .filter(turnoKey => turnos[turnoKey])
        .map(turnoKey => ({
          diaSemana: diaStr.toUpperCase(),
          turno: turnoKey.toString().toUpperCase()
        }));
    });
  }


  /**
   * Converte lista de DTOs em mapa interno para exibição
   */
  /*private toHorarioMap(lista: HorarioDTO[]): Record<string, any> {
    const map = this.getHorarioPadrao();

    lista.forEach(h => {
      const dia = h.diaSemana.toLowerCase();
      const turno = h.turno.toLowerCase() as keyof typeof map['segunda'];

      if (Object.prototype.hasOwnProperty.call(map, dia)) {
        const diaMap = map[dia as keyof typeof map];
        if (turno in diaMap) {
          diaMap[turno] = true;
        }
      }
    });

    return map;
  }*/

  private toHorarioMap(lista: HorarioDTO[]): Record<string, any> {
    const map = this.getHorarioPadrao();

    lista.forEach(h => {
      const dia = h.diaSemana.toLowerCase();
      const turno = h.turno.toLowerCase() as keyof typeof map['segunda'];

      if (map[dia] && map[dia][turno] !== undefined) {
        map[dia][turno] = true;
      }
    });

    return map;
  }


  private getHorarioPadrao(): Record<string, { manha: boolean; tarde: boolean; noite: boolean }> {
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

  private validarCampos(): boolean {
    if (!this.nomeFantasia.trim()) {
      this.showAlert('Atenção', 'Informe o nome da loja.');
      return false;
    }
    return true;
  }

  private async showAlert(header: string, msg: string, redirect = false) {
    const alert = await this.alertCtrl.create({
      header,
      message: msg,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            if (redirect) {
              this.navCtrl.navigateRoot('/minha-loja');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  voltar() {
    this.location.back();
  }
}


