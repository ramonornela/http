import { NgModule, ModuleWithProviders, SkipSelf, Optional } from '@angular/core';
import { Http as HttpAngular, BrowserXhr, ResponseOptions, XSRFStrategy, ConnectionBackend } from '@angular/http';
import { xhrBackendFactory, Events } from './backend/xhr_backend';
import { Http } from './http';
import {
  Plugins,
  HttpPluginsToken,
  ParseResponsePlugin,
  ParseResponseToken,
  ThrowExceptionStatus,
  ThrowExceptionStatusToken
} from './plugins';

@NgModule()
export class HttpModule {

  constructor(@Optional() @SkipSelf() parentModule: HttpModule) {
    if (parentModule) {
      throw new Error('HttpModule already loaded; Import in root module only.');
    }
  }

  static initialize(plugins: TypePlugins  = {
    provide: HttpPluginsToken,
    useClass: ParseResponsePlugin,
    deps: [ParseResponseToken],
    multi: true
  }): ModuleWithProviders {
    return {
      ngModule: HttpModule,
      providers: [
        Events,
        {
          provide: ConnectionBackend,
          useFactory: xhrBackendFactory,
          deps: [ BrowserXhr, ResponseOptions, XSRFStrategy, Events ]
        },
        HttpAngular,
        { provide: ThrowExceptionStatusToken, useValue: null },
        { provide: ParseResponseToken, useClass: ThrowExceptionStatus, deps: [ ThrowExceptionStatusToken ], multi: true },
        { provide: Plugins, useClass: Plugins, deps: [ HttpPluginsToken ] },
        Http,
        plugins
      ]
    };
  }
}

export interface TypePlugins {
  provide: any;
  useClass: any;
  multi: boolean;
  deps?: Array<any>;
}
