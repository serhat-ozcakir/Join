import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactFormDialog } from './contact-form-dialog';

describe('ContactFormDialog', () => {
  let component: ContactFormDialog;
  let fixture: ComponentFixture<ContactFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactFormDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactFormDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
