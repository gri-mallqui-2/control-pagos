import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriasList } from './categorias-list.component';

describe('CategoriasList', () => {
  let component: CategoriasList;
  let fixture: ComponentFixture<CategoriasList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriasList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoriasList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
