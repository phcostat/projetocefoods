import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecebidosPage } from './recebidos.page';

describe('RecebidosPage', () => {
  let component: RecebidosPage;
  let fixture: ComponentFixture<RecebidosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RecebidosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
