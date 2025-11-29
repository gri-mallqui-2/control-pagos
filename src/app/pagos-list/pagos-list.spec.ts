import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagosList } from './pagos-list';

describe('PagosList', () => {
  let component: PagosList;
  let fixture: ComponentFixture<PagosList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagosList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagosList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
