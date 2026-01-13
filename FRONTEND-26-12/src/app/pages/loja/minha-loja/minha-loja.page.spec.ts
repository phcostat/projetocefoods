import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MinhaLojaPage } from './minha-loja.page';

describe('MinhaLojaPage', () => {
  let component: MinhaLojaPage;
  let fixture: ComponentFixture<MinhaLojaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MinhaLojaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
