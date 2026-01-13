import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CadastrarNotaPage } from './cadastrar-nota.page';

describe('CadastrarNotaPage', () => {
  let component: CadastrarNotaPage;
  let fixture: ComponentFixture<CadastrarNotaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CadastrarNotaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
