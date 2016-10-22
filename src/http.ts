import { Injectable } from '@angular/core';
import { Http as HttpAngular, Response } from '@angular/http';
import { Events } from 'ionic-angular';
import { Request } from '@ramonornela/url-resolver';
import { HttpEvents } from './backend/xhr_backend';
import { Plugins } from './plugins/plugins';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class Http {

  constructor(
    protected http: HttpAngular,
    protected events: Events,
    protected requestFactory: Request,
    protected plugins: Plugins) {

    this.preRequest();
    this.postRequest();
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

  protected preRequest() {
    this.events.subscribe(HttpEvents.PRE_REQUEST, (req: any) => {
      this.plugins.each((plugin: any) => {
        plugin.preRequest(req[0]);
      });
    });
  }

  protected postRequest() {
    this.events.subscribe(HttpEvents.POST_REQUEST, (resp: any) => {
      this.plugins.each((plugin: any) => {
        plugin.postRequest(resp[0]);
      });
    });
  }
}
