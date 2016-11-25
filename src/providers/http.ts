import { Injectable, Optional } from '@angular/core';
import { Http as HttpAngular, Response as ResponseAngular } from '@angular/http';
import { Request } from '@ramonornela/url-resolver';
import { HttpEvents, Events } from './backend/xhr_backend';
import { Plugins, Plugin } from './plugins';
import { Observable } from 'rxjs/Observable';
import { Response } from './response';
import 'rxjs/add/operator/map';

@Injectable()
export class Http {

  constructor(
    protected http: HttpAngular,
    protected events: Events,
    protected plugins: Plugins,
    @Optional() protected requestFactory: Request) {

    this.runEvent(HttpEvents.PRE_REQUEST, 'preRequest');
    this.runEvent(HttpEvents.POST_REQUEST, 'postRequest');
    this.runEvent(HttpEvents.POST_REQUEST_SUCCESS, 'postRequestSuccess');
    this.runEvent(HttpEvents.POST_REQUEST_ERROR, 'postRequestError');
  }

  request(url: any, params?: Object, options?: any, response?: Response): Observable<ResponseAngular> {
    if (options instanceof Response) {
      response = options;
      options = null;
    }

    if (typeof url === 'string' && this.requestFactory) {
      url = this.requestFactory.create(url, params, options);
      options = null;
    }

    if (response instanceof Response) {
      return this.http.request(url, options).map((resp) => response.transform(resp.json()));
    }

    return this.http.request(url, options);
  }

  get(url: any, params?: Object, options?: any): Observable<ResponseAngular> {
    options = options || {};
    options.method = 'GET';
    return this.request(url, params, options);
  }

  post(url: any, params?: Object, options?: any): Observable<ResponseAngular> {
    options = options || {};
    options.method = 'POST';
    return this.request(url, params, options);
  }

  put(url: any, params?: Object, options?: any): Observable<ResponseAngular> {
    options = options || {};
    options.method = 'PUT';
    return this.request(url, params, options);
  }

  delete(url: any, params?: Object, options?: any): Observable<ResponseAngular> {
    options = options || {};
    options.method = 'DELETE';
    return this.request(url, params, options);
  }

  patch(url: any, params?: Object, options?: any): Observable<ResponseAngular> {
    options = options || {};
    options.method = 'PATCH';
    return this.request(url, params, options);
  }

  head(url: any, params?: Object, options?: any): Observable<ResponseAngular> {
    options = options || {};
    options.method = 'HEAD';
    return this.request(url, params, options);
  }

  getPlugins(): Plugins {
    return this.plugins;
  }

  getPlugin(name: string): Plugin | null {
    return this.getPlugins().get(name);
  }

  setDefaultOptions(options: any): this {
    if (!this.requestFactory) {
      throw new Error('Called not permited, need import the module UrlResolverModule in root module');
    }
    this.requestFactory.setDefaultOptions(options);
    return this;
  }

  onPreRequest(callback: (req?: any) => any) {
    this.events.subscribe(HttpEvents.PRE_REQUEST, callback);
  }

  onPostRequest(callback: (req?: any) => any) {
    this.events.subscribe(HttpEvents.POST_REQUEST, callback);
  }

  onPostRequestSuccess(callback: (req?: any) => any) {
    this.events.subscribe(HttpEvents.POST_REQUEST_SUCCESS, callback);
  }

  onPostRequestError(callback: (req?: any) => any) {
    this.events.subscribe(HttpEvents.POST_REQUEST_ERROR, callback);
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
