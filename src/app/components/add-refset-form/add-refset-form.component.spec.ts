import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRefsetFormComponent } from './add-refset-form.component';

describe('AddRefsetFormComponent', () => {
  let component: AddRefsetFormComponent;
  let fixture: ComponentFixture<AddRefsetFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddRefsetFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddRefsetFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
