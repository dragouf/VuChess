import { TestBed, inject } from '@angular/core/testing';

import { AuthFirebaseService } from './auth.firebase.service';

describe('Auth.FirebaseService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthFirebaseService]
    });
  });

  it('should be created', inject([AuthFirebaseService], (service: AuthFirebaseService) => {
    expect(service).toBeTruthy();
  }));
});
