import { Http as HttpAngular, Response } from '@angular/http';
import { Injectable, Inject, OpaqueToken, Optional } from '@angular/core';
import { HttpEvents } from './backend/xhr_backend';
import { TimeoutException } from './exception';
import { Plugins, Plugin } from './plugins';
import { Options } from './options';
import { Observable } from 'rxjs/Observable';
import { Request } from '@ramonornela/url-resolver';
import { Mapper } from './mapper';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/defer';
import 'rxjs/add/operator/timeoutWith';
import 'rxjs/add/operator/map';

export const RequestDefaultOptionsToken = new OpaqueToken('REQUESTDEFAULTOPTIONSTOKEN');
export const DefaultOptionsToken = new OpaqueToken('DEFAULTOPTIONSTOKEN');

@Injectable()
export class Http {

  protected options: Options = {};

  protected requestOptions: any = {};

  constructor(protected http: HttpAngular,
              protected events: HttpEvents,
              protected plugins: Plugins,
              @Optional() protected requestFactory: Request,
              @Optional() @Inject(RequestDefaultOptionsToken) defaultOptionsRequest: any,
              @Optional() @Inject(DefaultOptionsToken) defaultOptions: any) {

    this.runEvent('preRequest');
    this.runEvent('postRequest');
    this.runEvent('postRequestSuccess');
    this.runEvent('postRequestError');

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

  protected setOptionsPlugins(options: Object) {
    for (let pluginName in options) {
      let plugin = this.getPlugin(pluginName);
      if (!plugin) {
        throw new Error('Plugin not exists');
      }

      if (!('setOptions' in plugin)) {
        throw new Error('Plugin not implements setOptions()');
      }

      plugin.setOptions(options[pluginName]);
    }
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

    // merge of default options in case the urlResolver is not configured
    requestOptions = requestOptions || {};
    requestOptions = Object.assign({}, this.requestOptions, requestOptions);

    if (typeof url === 'string' && this.requestFactory) {
      if (this.requestFactory.getMetadata().has(url)) {
        url = this.requestFactory.create(url, params, requestOptions);
        requestOptions = null;
      }
    }

    if (options.pluginsOptions) {
      this.setOptionsPlugins(options.pluginsOptions);
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
      responseObservable.map((resp) => options.mapper.transform(resp));
    }

    return responseObservable;
  }

  requestPromise(url: any, params?: Object, requestOptions?: any, options?: Options): Promise<Response> {
    return this.request.apply(this, arguments).toPromise();
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

    let properties = [ 'mapper', 'timeout', 'pluginsOptions' ];
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

  setPluginsOptions(options: Object): this {
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

  protected runEvent(method: string) {
    let methodName = [
      'on',
      method.charAt(0).toUpperCase(),
      method.slice(1)
    ].join('');
    this.events[methodName].call(this.events, (req: any) => {
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
