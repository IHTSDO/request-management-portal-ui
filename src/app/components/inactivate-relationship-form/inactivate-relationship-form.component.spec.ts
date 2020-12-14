import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InactivateRelationshipFormComponent } from './inactivate-relationship-form.component';

describe('InactivateRelationshipFormComponent', () => {
  let component: InactivateRelationshipFormComponent;
  let fixture: ComponentFixture<InactivateRelationshipFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InactivateRelationshipFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InactivateRelationshipFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
