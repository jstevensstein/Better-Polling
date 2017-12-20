import { TestBed, inject } from '@angular/core/testing';

import { EmailUtilityService } from './email-utility.service';

describe('EmailUtilityService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EmailUtilityService]
    });
  });

  it('should be created', inject([EmailUtilityService], (service: EmailUtilityService) => {
    expect(service).toBeTruthy();
  }));
});
