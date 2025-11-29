import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagoDetail } from './pago-detail.component';

describe('PagoDetail', () => {
  let component: PagoDetail;
  let fixture: ComponentFixture<PagoDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagoDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagoDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
