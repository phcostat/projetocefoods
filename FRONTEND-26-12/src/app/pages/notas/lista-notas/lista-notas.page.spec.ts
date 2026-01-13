import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaNotasPage } from './lista-notas.page';

describe('ListaNotasPage', () => {
  let component: ListaNotasPage;
  let fixture: ComponentFixture<ListaNotasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaNotasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
