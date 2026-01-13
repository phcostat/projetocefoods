import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CriarLojaPage } from './criar-loja.page';

describe('CriarLojaPage', () => {
  let component: CriarLojaPage;
  let fixture: ComponentFixture<CriarLojaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CriarLojaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
