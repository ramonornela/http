import { NgModule } from '@angular/core';
import { Http as HttpAngular, BrowserXhr, ResponseOptions, XSRFStrategy, ConnectionBackend } from '@angular/http';
import { UrlResolverModule } from '@ramonornela/url-resolver';
import { xhrBackendFactory, HttpEvents } from './backend/xhr_backend';
import { Http } from './http';
import {
  Plugins,
  HttpPluginsToken,
  ParseResponsePlugin,
  ParseResponseToken,
  ThrowExceptionStatus,
  ThrowExceptionStatusToken
} from './plugins';

@NgModule({
  imports: [
    UrlResolverModule
  ],
  providers: [
    HttpEvents,
    {
      provide: ConnectionBackend,
      useFactory: xhrBackendFactory,
      deps: [ BrowserXhr, ResponseOptions, XSRFStrategy, HttpEvents ]
    },
    HttpAngular,
    { provide: ThrowExceptionStatusToken, useValue: null },
    { provide: ParseResponseToken, useClass: ThrowExceptionStatus, deps: [ ThrowExceptionStatusToken ], multi: true },
    { provide: Plugins, useClass: Plugins, deps: [ HttpPluginsToken ] },
    Http,
    { provide: HttpPluginsToken, useClass: ParseResponsePlugin, deps: [ ParseResponseToken ], multi: true }
  ]
})
export class HttpModule {
}
