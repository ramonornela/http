import { Injectable } from '@angular/core';
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
import { HTTP } from '@ionic-native/http';
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
      const headers    = req.headers;
      let headersSerialize = {};
      headers.forEach((value: any, index: string) => {
        if (value !== undefined || value !== '' || value !== null) {
          headersSerialize[index] = value;
        }
      });
      // @todo workaround assign origin
      if (!headers.has('origin')) {
        headersSerialize['Origin'] = 'null';
      }
      // @todo add headers and parameters
      switch (method) {
        case 'GET':
          promise = pluginHttp.get(req.url, {}, headersSerialize);
          break;
        case 'POST':
          if (headers.get('content-type') === 'application/json') {
            pluginHttp.setDataSerializer('json');
          } else {
            pluginHttp.setDataSerializer('urlencoded');
          }
          promise = pluginHttp.post(req.url, this.transformParemeters(), headersSerialize);
          break;
        case 'PUT':
          if (headers.get('content-type') === 'application/json') {
            pluginHttp.setDataSerializer('json');
          } else {
            pluginHttp.setDataSerializer('urlencoded');
          }
          promise = pluginHttp.put(req.url, this.transformParemeters(), headersSerialize);
          break;
        case 'DELETE':
          promise = pluginHttp.delete(req.url, {}, headersSerialize);
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
          body: error.data,
          type: ResponseType.Error,
          statusText: error.error
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

  transformParemeters(): { [key: string]: any } {
    let paramsResult: { [key: string]: any } = {};

    // transform query string in object ex: x=1&y=2 = {x: 1, y: 2}
    const body: any = this.request.getBody();
    if (typeof body === 'object') {
      try {
        return JSON.parse(body);
      } catch (e) {
        return body;
      }
    }

    try {
      return JSON.parse(body);
    } catch (e) {
      const params: string[] = body.split('&');
      for (const param of params) {
        const [ key, value ] = param.split('=');
        paramsResult[key] = value;
      }

      return paramsResult;
    }
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
