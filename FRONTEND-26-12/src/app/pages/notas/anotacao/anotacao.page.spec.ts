import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnotacaoPage } from './anotacao.page';

describe('AnotacaoPage', () => {
  let component: AnotacaoPage;
  let fixture: ComponentFixture<AnotacaoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AnotacaoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
