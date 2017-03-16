import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Subscriber } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { PreRequestPlugin } from './plugin';
import { PluginBase } from './plugin-base';

@Injectable()
export class CancelRequestPlugin extends PluginBase implements PreRequestPlugin {
  
  private _requests: Array<Observable<Response>> = [];

  protected get requests() {
    return this._requests = this._requests.filter((request: any) => request instanceof Subscriber && !request.closed);
  }

  getPriority(): number {
    return 3;
  }

  getName() {
    return 'cancel-request';
  }

  preRequest(response: any, subscriber: any) {
    this._requests.push(subscriber);
  }

  cancelAll() {
    this.requests.forEach((request: any) => request.unsubscribe());
  }
}
