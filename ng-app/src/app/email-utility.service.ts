import { Injectable } from '@angular/core';

import { EMAIL_REGEX } from '../../../shared/globals';

@Injectable()
export class EmailUtilityService {

  constructor() { }

  parsePotentialEmails(value : string): string[] {
    return value.split(/\r|\n|;|,/).filter(e => e).map(e => e.trim());
  }

  parseInvalidEmails(value : string): string[] {
    return this.parsePotentialEmails(value)
    .filter(function(email){
      return !email.match(EMAIL_REGEX);
    });
  }
}
