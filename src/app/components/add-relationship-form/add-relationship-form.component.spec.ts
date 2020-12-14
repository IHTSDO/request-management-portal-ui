import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRelationshipFormComponent } from './add-relationship-form.component';

describe('AddRelationshipFormComponent', () => {
  let component: AddRelationshipFormComponent;
  let fixture: ComponentFixture<AddRelationshipFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddRelationshipFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddRelationshipFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
