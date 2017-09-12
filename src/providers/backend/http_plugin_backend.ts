import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http';
import {
  BrowserXhr,
  Connection,
  ConnectionBackend
} from '@angular/http';
import { HttpEvents } from './events';

export function httpPluginBackendFactory(
  events: HttpEvents,
  http: HTTP) {
  return new HttpPluginBackend(http, events);
}

export class HttpPluginConnection implements Connection {
  constructor(req: Request, pluginHttp: HTTP, private events?: HttpEvents) {
    // implement observable with promise
  }
}

@Injectable()
export class HttpPluginBackend implements ConnectionBackend {
  constructor(
      private browserXHR: BrowserXhr,
      private pluginHttp: HTTP,
      private events: HttpEvents) {}

  createConnection(request: Request): HttpPluginConnection {
    return new HttpPluginConnection(request, this.pluginHttp, this.events);
  }
}
