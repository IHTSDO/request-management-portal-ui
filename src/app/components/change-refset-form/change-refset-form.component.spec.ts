import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeRefsetFormComponent } from './change-refset-form.component';

describe('ChangeRefsetFormComponent', () => {
  let component: ChangeRefsetFormComponent;
  let fixture: ComponentFixture<ChangeRefsetFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeRefsetFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangeRefsetFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
