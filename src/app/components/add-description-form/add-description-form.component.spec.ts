import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDescriptionFormComponent } from './add-description-form.component';

describe('AddDescriptionFormComponent', () => {
  let component: AddDescriptionFormComponent;
  let fixture: ComponentFixture<AddDescriptionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddDescriptionFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDescriptionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
