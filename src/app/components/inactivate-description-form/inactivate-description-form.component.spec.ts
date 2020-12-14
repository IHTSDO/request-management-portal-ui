import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InactivateDescriptionFormComponent } from './inactivate-description-form.component';

describe('InactivateDescriptionFormComponent', () => {
  let component: InactivateDescriptionFormComponent;
  let fixture: ComponentFixture<InactivateDescriptionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InactivateDescriptionFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InactivateDescriptionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
