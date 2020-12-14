import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddConceptFormComponent } from './add-concept-form.component';

describe('AddConceptFormComponent', () => {
  let component: AddConceptFormComponent;
  let fixture: ComponentFixture<AddConceptFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddConceptFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddConceptFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
