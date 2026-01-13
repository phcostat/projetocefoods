import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { Usuario } from 'src/app/model/usuario';

@Component({
  selector: 'app-editar-perfil',
  templateUrl: './editar-perfil.page.html',
  styleUrls: ['./editar-perfil.page.scss'],
  standalone: false
})
export class EditarPerfilPage implements OnInit, OnDestroy {
  usuario!: Usuario;
  formData: Partial<Usuario> = {};
  fotoPreview: string | null = null;
  fotoSelecionada: File | null = null;

  constructor(
    private authService: AuthService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private router: Router
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.getUsuarioLogado();
    if (!usuario) {
      this.router.navigate(['/login']);
      return;
    }

    this.usuario = { ...usuario };
    this.formData = { ...usuario };
    this.fotoPreview = usuario.fotoPerfil || null;
  }

  ngOnDestroy(): void {
    this.revokeBlobUrl(this.fotoPreview);
  }

  atualizarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    if (!file) {
      return;
    }

    this.revokeBlobUrl(this.fotoPreview);
    this.fotoSelecionada = file;
    this.fotoPreview = URL.createObjectURL(file);
  }

  async salvarAlteracoes(): Promise<void> {
    if (!this.usuario?.idUsuario) {
      return;
    }

    const payload: Usuario = {
      ...this.usuario,
      ...this.formData,
      idUsuario: this.usuario.idUsuario,
      senha: this.usuario.senha
    };

    try {
      let atualizado = await this.authService.updateUsuario(payload);

      if (this.fotoSelecionada) {
        atualizado = await this.authService.uploadFotoPerfil(atualizado.idUsuario, this.fotoSelecionada);
        this.revokeBlobUrl(this.fotoPreview);
        this.fotoSelecionada = null;
        this.fotoPreview = atualizado.fotoPerfil || null;
      }

      this.usuario = atualizado;
      this.formData = { ...atualizado };

      const toast = await this.toastCtrl.create({
        message: 'Perfil atualizado com sucesso!',
        duration: 2000,
        color: 'success'
      });
      await toast.present();

      this.navCtrl.back();
    } catch (error) {
      const toast = await this.toastCtrl.create({
        message: 'Erro ao atualizar o perfil.',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  private revokeBlobUrl(url: string | null): void {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }

  async alterarSenha(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Alterar Senha',
      inputs: [
        { name: 'senhaAtual', type: 'password', placeholder: 'Senha atual' },
        { name: 'novaSenha', type: 'password', placeholder: 'Nova senha' },
        { name: 'confirmaSenha', type: 'password', placeholder: 'Confirme a nova senha' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Salvar',
          handler: async (data: any) => {
            if (data.novaSenha !== data.confirmaSenha) {
              const toast = await this.toastCtrl.create({
                message: 'As senhas não coincidem!',
                duration: 2000,
                color: 'danger'
              });
              await toast.present();
              return false;
            }

            if (data.senhaAtual !== this.usuario.senha) {
              const toast = await this.toastCtrl.create({
                message: 'Senha atual incorreta!',
                duration: 2000,
                color: 'danger'
              });
              await toast.present();
              return false;
            }

            try {
              const atualizado = await this.authService.updateUsuario({
                ...this.usuario,
                senha: data.novaSenha
              });
              this.usuario = atualizado;
              this.formData = { ...atualizado };

              const toast = await this.toastCtrl.create({
                message: 'Senha alterada com sucesso!',
                duration: 2000,
                color: 'success'
              });
              await toast.present();
            } catch (error) {
              const toast = await this.toastCtrl.create({
                message: 'Erro ao alterar senha.',
                duration: 2000,
                color: 'danger'
              });
              await toast.present();
            }

            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async desativarConta(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Desativar / Excluir Conta',
      message: 'Tem certeza? Você poderá reativar apenas criando uma nova conta.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: async () => {
            try {
              await this.authService.deleteUsuario(this.usuario.idUsuario);
              this.authService.logout();
              this.router.navigate(['/login']);

              const toast = await this.toastCtrl.create({
                message: 'Conta excluída com sucesso.',
                duration: 2000,
                color: 'danger'
              });
              await toast.present();
            } catch (error) {
              const toast = await this.toastCtrl.create({
                message: 'Erro ao excluir conta.',
                duration: 2000,
                color: 'danger'
              });
              await toast.present();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  voltar(): void { this.navCtrl.back(); }
  irMenu(): void { this.router.navigate(['/inicio']); }
  irPesquisa(): void { this.router.navigate(['/pesquisa']); }
  irPerfil(): void { this.router.navigate(['/perfil']); }
  irCarrinho(): void { this.router.navigate(['/carrinho']); }
}


