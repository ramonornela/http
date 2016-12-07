import { Http as HttpAngular, Response } from '@angular/http';
import { Injectable, Inject, OpaqueToken, Optional } from '@angular/core';
import { HttpEvents, Events } from './backend/xhr_backend';
import { TimeoutException } from './exception';
import { Plugins, Plugin } from './plugins';
import { ResponseOptions } from './response-options';
import { Observable } from 'rxjs/Observable';
import { Request } from '@ramonornela/url-resolver';
import { Mapper } from './mapper';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/defer';
import 'rxjs/add/operator/timeoutWith';
import 'rxjs/add/operator/map';

export const RequestDefaultOptionsToken = new OpaqueToken('REQUESTDEFAULTOPTIONSTOKEN');
export const ResponseDefaultOptionsToken = new OpaqueToken('RESPONSEDEFAULTOPTIONSTOKEN');

@Injectable()
export class Http {

  protected responseOptions: ResponseOptions = {};

  constructor(protected http: HttpAngular,
              protected events: Events,
              protected plugins: Plugins,
              @Optional() protected requestFactory: Request,
              @Optional() @Inject(RequestDefaultOptionsToken) defaultRequest: any,
              @Optional() @Inject(ResponseDefaultOptionsToken) defaultResponse: any) {

    this.runEvent(HttpEvents.PRE_REQUEST, 'preRequest');
    this.runEvent(HttpEvents.POST_REQUEST, 'postRequest');
    this.runEvent(HttpEvents.POST_REQUEST_SUCCESS, 'postRequestSuccess');
    this.runEvent(HttpEvents.POST_REQUEST_ERROR, 'postRequestError');

    if (defaultRequest) {
      this.setDefaultRequestOptions(defaultRequest);
    }

    if (defaultResponse) {
      this.setDefaultResponseOptions(defaultResponse);
    }
  }

  getRequestFactory(): Request {
    return this.requestFactory;
  }

  request(url: any, params?: Object, requestOptions?: any, responseOptions?: ResponseOptions): Observable<Response> {

    if (!(url instanceof Request) && arguments.length === 1 && typeof url === 'object') {
      let objParams = url;
      url = objParams.url;
      params = objParams.params;
      requestOptions = objParams.requestOptions;
      responseOptions = objParams.responseOptions;
    }

    if (requestOptions && this.checkForResponseOptions(requestOptions)) {
      responseOptions = requestOptions;
      requestOptions = null;
    }

    responseOptions = responseOptions || {};

    this.applyDefaultResponseOptions(responseOptions);

    if (typeof url === 'string' && this.requestFactory) {
      if (this.requestFactory.getMetadata().has(url)) {
        url = this.requestFactory.create(url, params, requestOptions);
        requestOptions = null;
      }
    }

    let responseObservable = this.http.request(url, requestOptions);

    if (responseOptions.timeout) {
      responseObservable = responseObservable
        .timeoutWith(responseOptions.timeout, Observable.defer(() => {
          let err = new TimeoutException();
          this.events.publish(HttpEvents.POST_REQUEST_ERROR, err);
          return Observable.throw(err);
        }));
    }

    if (responseOptions.mapper instanceof Mapper) {
      responseObservable.map((resp) => responseOptions.mapper.transform(resp));
    }

    return responseObservable;
  }

  requestPromise(url: any, params?: Object, requestOptions?: any, responseOptions?: ResponseOptions): Promise<Response> {
    return this.request.apply(this, arguments).toPromise();
  }

  get(url: any, params?: Object, requestOptions?: any, responseOptions?: ResponseOptions): Observable<Response> {
    requestOptions = requestOptions || {};
    requestOptions.method = 'GET';
    return this.request(url, params, requestOptions, responseOptions);
  }

  post(url: any, params?: Object, requestOptions?: any, responseOptions?: ResponseOptions): Observable<Response> {
    requestOptions = requestOptions || {};
    requestOptions.method = 'POST';
    return this.request(url, params, requestOptions, responseOptions);
  }

  put(url: any, params?: Object, requestOptions?: any, responseOptions?: ResponseOptions): Observable<Response> {
    requestOptions = requestOptions || {};
    requestOptions.method = 'PUT';
    return this.request(url, params, requestOptions, responseOptions);
  }

  delete(url: any, params?: Object, requestOptions?: any, responseOptions?: ResponseOptions): Observable<Response> {
    requestOptions = requestOptions || {};
    requestOptions.method = 'DELETE';
    return this.request(url, params, requestOptions, responseOptions);
  }

  patch(url: any, params?: Object, requestOptions?: any, responseOptions?: ResponseOptions): Observable<Response> {
    requestOptions = requestOptions || {};
    requestOptions.method = 'PATCH';
    return this.request(url, params, requestOptions, responseOptions);
  }

  head(url: any, params?: Object, requestOptions?: any, responseOptions?: ResponseOptions): Observable<Response> {
    requestOptions = requestOptions || {};
    requestOptions.method = 'HEAD';
    return this.request(url, params, requestOptions, responseOptions);
  }

  protected checkForResponseOptions(obj: any): boolean {

    let properties = [ 'mapper', 'timeout' ];
    for (let prop of properties) {
      if (prop in obj) {
        return true;
      }
    }

    return false;
  }

  protected applyDefaultResponseOptions(options: ResponseOptions) {
    options.mapper = options.mapper || this.responseOptions.mapper;
    options.timeout = options.timeout || this.responseOptions.timeout;
  }

  setDefaultResponseOptions(options: ResponseOptions): this {
    this.responseOptions = options;
    return this;
  }

  setResponseTimeout(timeout: number): this {
    this.responseOptions.timeout = timeout;
    return this;
  }

  setResponseMapper(mapper: Mapper): this {
    this.responseOptions.mapper = mapper;
    return this;
  }

  getPlugins(): Plugins {
    return this.plugins;
  }

  getPlugin(name: string): Plugin | null {
    return this.getPlugins().get(name);
  }

  setDefaultRequestOptions(options: any): this {
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

  protected runEvent(subscribe: string, method: string) {
    this.events.subscribe(subscribe, (req: any) => {
      this.plugins.forEach((plugin: any) => {
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
