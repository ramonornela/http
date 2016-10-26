import { Injectable, OpaqueToken, Optional } from '@angular/core';
import { Response } from '@angular/http';
import { ParseResponse } from './parse-response';
import { HttpException } from '../../exception';

export const ThrowExceptionStatusToken = new OpaqueToken('THROWEXCEPTIONSTATUS');

@Injectable()
export class ThrowExceptionStatus implements ParseResponse {

  constructor(@Optional() private fnExtractMessage?: any) {}

  parse(response: Response): void {
    this.throw(response);
  }

  protected throw(response: Response) {
    if (response.status >= 400 || response.status >= 500) {
      let message = typeof this.fnExtractMessage === 'function'
                  ? this.fnExtractMessage.apply(this, [response])
                  : this.extractMessage(response);
      throw new HttpException(message, response.status);
    }

    if (response.status === 0) {
      throw new HttpException('Unknown', response.status);
    }
  }

  protected extractMessage(response: Response) {
    return response.statusText;
  }
}
