import { TestBed } from '@angular/core/testing';

import { ImsService } from './ims.service';

describe('ImsService', () => {
  let service: ImsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
