import { Injectable } from '@angular/core';
import { ConnectionBackend, Http, RequestOptions } from '@angular/http';

export function httpFactory(connectionBackend: ConnectionBackend, defaultOptions: RequestOptions) {
  return new HttpOverride(connectionBackend, defaultOptions);
}

@Injectable()
export class HttpOverride extends Http {
  constructor(connectionBackend: ConnectionBackend, defaultOptions: RequestOptions) {
    super(connectionBackend, defaultOptions);
  }
}
