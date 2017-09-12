import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http';
import {
  Connection,
  ConnectionBackend,
  ReadyState,
  Request,
  RequestMethod,
  Response
} from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { HttpEvents } from './events';

export function httpPluginBackendFactory(
  events: HttpEvents,
  http: HTTP) {
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

      switch (method) {
        case 'GET':
          pluginHttp.get(req.url, {}, {});
          break;
        case 'POST':
          pluginHttp.post(req.url, {}, {});
          break;
        case 'PUT':
          pluginHttp.post(req.url, {}, {});
          break;
        case 'DELETE':
          pluginHttp.delete(req.url, {}, {});
          break;
        default:
          throw new Error(`Method '${method}' not allowed`);
      }
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
