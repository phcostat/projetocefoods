import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TipoPage } from './tipo.page';

describe('TipoPage', () => {
  let component: TipoPage;
  let fixture: ComponentFixture<TipoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TipoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
