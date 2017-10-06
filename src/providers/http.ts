import { Inject, Injectable, OpaqueToken, Optional } from '@angular/core';
import { Http as HttpAngular, RequestOptions, Response } from '@angular/http';
import { Config } from '@mbamobi/configuration';
import { Request } from '@mbamobi/url-resolver';
import 'rxjs/add/observable/defer';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeoutWith';
import 'rxjs/add/operator/toPromise';
import { Observable } from 'rxjs/Observable';
import { HttpEvents, HttpPluginBackend, XHRBackend } from './backend';
import { TimeoutException } from './exception';
import { Mapper } from './mapper';
import { Options } from './options';
import { Plugin, Plugins } from './plugins';

export const RequestDefaultOptionsToken = new OpaqueToken('REQUESTDEFAULTOPTIONSTOKEN');
export const DefaultOptionsToken = new OpaqueToken('DEFAULTOPTIONSTOKEN');

const KEY_CONFIG = 'http';

export interface LastRequest {
  url: any;
  params: Object;
  requestOptions: any;
  options: Options;
}

@Injectable()
export class Http {

  protected options: Options = {};

  protected requestOptions: any = {};

  protected lastRequest: LastRequest = null;

  protected requests: {[key: string]: LastRequest} = {};

  protected http: HttpAngular;

  constructor(options: RequestOptions,
              backend: XHRBackend | HttpPluginBackend,
              protected events: HttpEvents,
              protected plugins: Plugins,
              @Optional() config: Config,
              @Optional() protected requestFactory: Request,
              @Optional() @Inject(RequestDefaultOptionsToken) defaultOptionsRequest: any,
              @Optional() @Inject(DefaultOptionsToken) defaultOptions: any) {

    this.http = new HttpAngular(backend, options);

    if (config) {
      let httpConfig = config.get(KEY_CONFIG) || {};

      if (!defaultOptionsRequest && httpConfig.defaultOptionsRequest) {
        defaultOptionsRequest = httpConfig.defaultOptionsRequest;
      }

      if (!defaultOptions && httpConfig.defaultOptions) {
        defaultOptions = httpConfig.defaultOptions;
      }
    }

    if (defaultOptionsRequest) {
      this.setDefaultRequestOptions(defaultOptionsRequest);
    }

    if (defaultOptions) {
      this.setDefaultOptions(defaultOptions);
    }
  }

  getRequestFactory(): Request {
    return this.requestFactory;
  }

  canRetry(id?: string) {
    if (id) {
      return this.requests[id] !== undefined;
    }

    return this.lastRequest !== null;
  }

  getLastRequest() {
    return this.lastRequest;
  }

  retryRequest(id?: string): Observable<Response> {

    if (id) {
      if (!this.requests[id]) {
        throw new Error(`${id} not exists to retry`);
      }

      return this.request(this.requests[id]);
    }

    return this.request(this.lastRequest);
  }

  request(url: any, params?: Object, requestOptions?: any, options?: Options): Observable<Response> {

    if (!(url instanceof Request) && arguments.length === 1 && typeof url === 'object') {
      let objParams = url;
      url = objParams.url;
      params = objParams.params;
      requestOptions = objParams.requestOptions;
      options = objParams.options;
    }

    if (requestOptions && this.checkForOptions(requestOptions)) {
      options = requestOptions;
      requestOptions = null;
    }

    options = options || {};

    this.applyDefaultOptions(options);

    this.lastRequest = null;
    if (options.retry) {
      this.lastRequest = {
        url,
        params,
        requestOptions,
        options
      };

      this.requests[url] = this.lastRequest;
    }

    // merge of default options in case the urlResolver is not configured
    requestOptions = requestOptions || {};
    requestOptions = Object.assign({}, this.requestOptions, requestOptions);

    requestOptions.params = params;

    if (typeof url === 'string' && this.requestFactory) {
      if (this.requestFactory.getMetadata().has(url)) {
        delete requestOptions.params;
        url = this.requestFactory.create(url, params, requestOptions);
        requestOptions = null;
      }
    }

    if (options.pluginsOptions) {
      this.plugins.setOptions(options.pluginsOptions);
    }

    let responseObservable = this.http.request(url, requestOptions);

    if (options.timeout) {
      responseObservable = responseObservable
        .timeoutWith(options.timeout, Observable.defer(() => {
          let err = new TimeoutException();
          this.events.publish(HttpEvents.POST_REQUEST_ERROR, err);
          return Observable.throw(err);
        }));
    }

    if (options.mapper instanceof Mapper) {
      responseObservable = responseObservable.map((resp) => options.mapper.transform(resp));
    }

    return responseObservable;
  }

  requestPromise(url: any, params?: Object, requestOptions?: any, options?: Options): Promise<Response> {
    return this.request.apply(this, [ url, params, requestOptions, options ]).toPromise();
  }

  get(url: any, params?: Object, requestOptions?: any, options?: Options): Observable<Response> {
    requestOptions = requestOptions || {};
    requestOptions.method = 'GET';
    return this.request(url, params, requestOptions, options);
  }

  post(url: any, params?: Object, requestOptions?: any, options?: Options): Observable<Response> {
    requestOptions = requestOptions || {};
    requestOptions.method = 'POST';
    return this.request(url, params, requestOptions, options);
  }

  put(url: any, params?: Object, requestOptions?: any, options?: Options): Observable<Response> {
    requestOptions = requestOptions || {};
    requestOptions.method = 'PUT';
    return this.request(url, params, requestOptions, options);
  }

  delete(url: any, params?: Object, requestOptions?: any, options?: Options): Observable<Response> {
    requestOptions = requestOptions || {};
    requestOptions.method = 'DELETE';
    return this.request(url, params, requestOptions, options);
  }

  patch(url: any, params?: Object, requestOptions?: any, options?: Options): Observable<Response> {
    requestOptions = requestOptions || {};
    requestOptions.method = 'PATCH';
    return this.request(url, params, requestOptions, options);
  }

  head(url: any, params?: Object, requestOptions?: any, options?: Options): Observable<Response> {
    requestOptions = requestOptions || {};
    requestOptions.method = 'HEAD';
    return this.request(url, params, requestOptions, options);
  }

  protected checkForOptions(obj: any): boolean {

    let properties = [ 'mapper', 'timeout', 'retry', 'pluginsOptions' ];
    for (let prop of properties) {
      if (prop in obj) {
        return true;
      }
    }

    return false;
  }

  protected applyDefaultOptions(options: Options) {
    options.mapper = options.mapper || this.options.mapper;
    options.timeout = options.timeout || this.options.timeout;
    options.pluginsOptions = options.pluginsOptions || this.options.pluginsOptions;
    options.retry = options.retry || this.options.retry;
  }

  setDefaultOptions(options: Options): this {
    this.options = options;
    return this;
  }

  setTimeout(timeout: number): this {
    this.options.timeout = timeout;
    return this;
  }

  setMapper(mapper: Mapper): this {
    this.options.mapper = mapper;
    return this;
  }

  setRetry(retry: boolean): this {
    this.options.retry = retry;
    return this;
  }

  setPluginsOptions(options: {[key: string]: {[key: string]: any}}): this {
    this.options.pluginsOptions = options;
    return this;
  }

  getPlugins(): Plugins {
    return this.plugins;
  }

  getEvents(): HttpEvents {
    return this.events;
  }

  getPlugin(name: string): Plugin | null {
    return this.getPlugins().get(name);
  }

  setDefaultRequestOptions(options: any): this {
    if (this.requestFactory) {
      this.requestFactory.setDefaultOptions(options);
      return this;
    }

    this.requestOptions = options;
    return this;
  }
}

@Injectable()
export class HttpCordovaPlugin extends Http {
  constructor(
    options: RequestOptions,
    backend: HttpPluginBackend,
    events: HttpEvents,
    plugins: Plugins,
    @Optional() config: Config,
    @Optional() requestFactory: Request,
    @Optional() @Inject(RequestDefaultOptionsToken) defaultOptionsRequest: any,
    @Optional() @Inject(DefaultOptionsToken) defaultOptions: any) {
      super(
        options,
        backend,
        events,
        plugins,
        config,
        requestFactory,
        defaultOptionsRequest,
        defaultOptions
      );
  }
}
