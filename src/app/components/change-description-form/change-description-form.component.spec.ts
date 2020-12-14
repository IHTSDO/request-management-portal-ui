import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeDescriptionFormComponent } from './change-description-form.component';

describe('ChangeDescriptionFormComponent', () => {
  let component: ChangeDescriptionFormComponent;
  let fixture: ComponentFixture<ChangeDescriptionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChangeDescriptionFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeDescriptionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
