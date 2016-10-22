import { Injectable, OpaqueToken } from '@angular/core';
import { Plugin } from './plugin';
import { ParseResponse } from './response/parse-response';

export const ParseResponseToken = new OpaqueToken('PARSE_RESPONSE');

@Injectable()
export class ParseResponsePlugin implements Plugin {

  constructor(private parseResponses: Array<ParseResponse>) {
  }

  getPriority(): number {
    return 1;
  }

  getName() {
    return 'parse-response';
  }

  preRequest() {}

  postRequest(response: any) {
    for (let parseResponse of this.parseResponses) {
      parseResponse.parse(response);
    }
  }
}
