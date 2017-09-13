import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http';
import {
  Connection,
  ConnectionBackend,
  ReadyState,
  Request,
  RequestMethod,
  Response,
  ResponseOptions,
  ResponseType
} from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { HttpEvents, isSuccess } from './utils';

export function httpPluginBackendFactory(
  http: HTTP,
  events: HttpEvents) {
  return new HttpPluginBackend(http, events);
}

export class HttpPluginConnection implements Connection {

  readyState: ReadyState;

  response: Observable<Response>;

  request: Request;

  constructor(req: Request, pluginHttp: HTTP, private events?: HttpEvents) {
    this.request = req;
    // implement observable with promise
    this.response = new Observable<Response>((responseObserver: Observer<Response>) => {
      const method = RequestMethod[req.method].toUpperCase();

      this.events.preRequest(req, responseObserver);
      let promise: any;
      const headers = req.headers.toJSON();
      // @todo add headers and parameters
      switch (method) {
        case 'GET':
          promise = pluginHttp.get(req.url, {}, headers);
          break;
        case 'POST':
          promise = pluginHttp.post(req.url, {}, headers);
          break;
        case 'PUT':
          promise = pluginHttp.put(req.url, {}, headers);
          break;
        case 'DELETE':
          promise = pluginHttp.delete(req.url, {}, headers);
          break;
        default:
          throw new Error(`Method '${method}' not allowed`);
      }

      promise.then((data: any) => {
        const status = data.status;
        const responseOptions = new ResponseOptions({
          status,
          body: data.data,
          headers: data.headers,
          url: req.url,
          statusText: '' // @todo
        });
        const response = new Response(responseOptions);
        response.ok = isSuccess(status);
        if (response.ok) {
          this.events.postRequestSuccess(response);
          this.events.postRequest(response);

          responseObserver.next(response);
          responseObserver.complete();
        }

        let exception;
        try {
          responseObserver.error(response);
        } catch (ex) {
          exception = ex;
        }

        this.events.postRequestError(response);
        this.events.postRequest(response);

        if (exception) {
          throw exception;
        }
      }).catch((error: any) => {
        const responseOptions = new ResponseOptions({
          status: error.status,
          body: error,
          type: ResponseType.Error,
          statusText: '' // @todo
        });
        const response = new Response(responseOptions);
        let exception;
        try {
          responseObserver.error(response);
        } catch (ex) {
          exception = ex;
        }

        this.events.postRequestError(response);
        this.events.postRequest(response);

        if (exception) {
          throw exception;
        }
      });
    });
  }
}

@Injectable()
export class HttpPluginBackend implements ConnectionBackend {
  constructor(
      private pluginHttp: HTTP,
      private events: HttpEvents) {}

  createConnection(request: Request): HttpPluginConnection {
    return new HttpPluginConnection(request, this.pluginHttp, this.events);
  }
}
