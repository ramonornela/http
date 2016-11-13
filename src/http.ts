import { Injectable } from '@angular/core';
import { Http as HttpAngular, Response } from '@angular/http';
import { Request } from '@ramonornela/url-resolver';
import { HttpEvents, Events } from './backend/xhr_backend';
import { Plugins, Plugin } from './plugins';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class Http {

  constructor(
    protected http: HttpAngular,
    protected events: Events,
    protected requestFactory: Request,
    protected plugins: Plugins) {

    this.runEvent(HttpEvents.PRE_REQUEST, 'preRequest');
    this.runEvent(HttpEvents.POST_REQUEST, 'postRequest');
    this.runEvent(HttpEvents.POST_REQUEST_SUCCESS, 'postRequestSuccess');
    this.runEvent(HttpEvents.POST_REQUEST_ERROR, 'postRequestError');
  }

  request(url: any, params?: Object, options?: any): Observable<Response> {
    if (typeof url === 'string') {
      url = this.requestFactory.create(url, params, options);
    }

    return this.http.request(url, null);
  }

  getPlugins(): Plugins {
    return this.plugins;
  }

  getPlugin(name: string): Plugin | null {
    return this.getPlugins().get(name);
  }

  setDefaultOptions(options: any): this {
    this.requestFactory.setDefaultOptions(options);
    return this;
  }

  private runEvent(subscribe: string, method: string) {
    this.events.subscribe(subscribe, (req: any) => {
      this.plugins.each((plugin: any) => {
        // workaround typescript not exists verification of interfaces
        if (!(method in plugin)) {
          return;
        }

        let stop = plugin[method](req);

        if (stop === false) {
          this.events.stop();
        }
      });
    });
  }
}
