import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddTipoPage } from './add-tipo.page';

describe('AddTipoPage', () => {
  let component: AddTipoPage;
  let fixture: ComponentFixture<AddTipoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTipoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
