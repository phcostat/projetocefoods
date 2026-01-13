import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilLojaPage } from './perfil-loja.page';

describe('PerfilLojaPage', () => {
  let component: PerfilLojaPage;
  let fixture: ComponentFixture<PerfilLojaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PerfilLojaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
