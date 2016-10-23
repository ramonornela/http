import { Injectable } from '@angular/core';
import { Http as HttpAngular, Response } from '@angular/http';
import { Request } from '@ramonornela/url-resolver';
import { HttpEvents } from './backend/xhr_backend';
import { Plugins } from './plugins/plugins';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class Http {

  constructor(
    protected http: HttpAngular,
    protected events: HttpEvents,
    protected requestFactory: Request,
    protected plugins: Plugins) {

    this.runEvent(HttpEvents.PRE_REQUEST, 'preRequest');
    this.runEvent(HttpEvents.POST_REQUEST, 'postRequest');
  }

  request(url: any, params?: Object, headers?: {[key: string]: any}, body?: any): Observable<Response> {
    if (typeof url === 'string') {
      url = this.requestFactory.create(url, params, headers, body);
    }

    return this.http.request(url, null);
  }

  getPlugins() {
    return this.plugins;
  }

  runEvent(subscribe: string, method: string) {
    this.events.subscribe(subscribe, (req: any) => {
      this.plugins.each((plugin: any) => {
        let stop = plugin[method](req);

        if (stop === false) {
          this.events.stop();
        }
      });
    });
  }
}
