import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MeusPedidosPage } from './meus-pedidos.page';

describe('MeusPedidosPage', () => {
  let component: MeusPedidosPage;
  let fixture: ComponentFixture<MeusPedidosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MeusPedidosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
