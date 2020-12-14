import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeRelationshipFormComponent } from './change-relationship-form.component';

describe('ChangeRelationshipFormComponent', () => {
  let component: ChangeRelationshipFormComponent;
  let fixture: ComponentFixture<ChangeRelationshipFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChangeRelationshipFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeRelationshipFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
