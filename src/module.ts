import { NgModule, ModuleWithProviders, SkipSelf, Optional } from '@angular/core';
import { Http as HttpAngular, BrowserXhr, ResponseOptions, XSRFStrategy, ConnectionBackend } from '@angular/http';
import {
  Http,
  xhrBackendFactory,
  Events,
  HttpPluginsToken,
  Plugins,
  ParseResponsePlugin,
  ParseResponseToken,
  RequestDefaultOptionsToken,
  DefaultOptionsToken,
  ThrowExceptionStatus,
  ThrowExceptionStatusToken
} from './providers';

@NgModule()
export class HttpModule {

  constructor(@Optional() @SkipSelf() parentModule: HttpModule) {
    if (parentModule) {
      throw new Error('HttpModule already loaded; Import in root module only.');
    }
  }

  static initialize(plugins: Array<TypePlugins>, defaultRequest?: any, defaultResponse?: any): ModuleWithProviders {
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
        { provide: RequestDefaultOptionsToken, useValue: defaultRequest },
        { provide: DefaultOptionsToken, useValue: defaultResponse },
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

export const DefaultPlugins: any = [
  {
    provide: HttpPluginsToken,
    useClass: ParseResponsePlugin,
    deps: [ ParseResponseToken ],
    multi: true
  }
];
