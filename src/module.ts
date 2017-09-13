import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { BrowserXhr, ConnectionBackend, RequestOptions, ResponseOptions, XSRFStrategy } from '@angular/http';
import { HTTP } from '@ionic-native/http';
import {
  CancelRequestPlugin,
  DefaultOptionsToken,
  Events,
  Http,
  HttpEvents,
  httpFactory,
  HttpOverride,
  httpPluginBackendFactory,
  HttpCordovaPlugin,
  HttpPluginsToken,
  ParseResponsePlugin,
  ParseResponseToken,
  Plugins,
  RequestDefaultOptionsToken,
  ThrowExceptionStatus,
  ThrowExceptionStatusToken,
  xhrBackendFactory
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
        HttpEvents,
        {
          provide: ConnectionBackend,
          useFactory: xhrBackendFactory,
          deps: [ BrowserXhr, ResponseOptions, XSRFStrategy, HttpEvents ]
        },
        { provide: HttpOverride, useFactory: httpFactory, deps: [ ConnectionBackend, RequestOptions ] },
        { provide: ThrowExceptionStatusToken, useValue: null },
        { provide: ParseResponseToken, useClass: ThrowExceptionStatus, deps: [ ThrowExceptionStatusToken ], multi: true },
        { provide: Plugins, useClass: Plugins, deps: [ HttpEvents, HttpPluginsToken ] },
        { provide: RequestDefaultOptionsToken, useValue: defaultRequest },
        { provide: DefaultOptionsToken, useValue: defaultResponse },
        Http,
        plugins
      ]
    };
  }
}

@NgModule()
export class HttpCordovaPluginModule {

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
        HttpEvents,
        HTTP,
        {
          provide: ConnectionBackend,
          useFactory: httpPluginBackendFactory,
          deps: [ HTTP, HttpEvents ]
        },
        { provide: HttpOverride, useFactory: httpFactory, deps: [ ConnectionBackend, RequestOptions ] },
        { provide: ThrowExceptionStatusToken, useValue: null },
        { provide: ParseResponseToken, useClass: ThrowExceptionStatus, deps: [ ThrowExceptionStatusToken ], multi: true },
        { provide: Plugins, useClass: Plugins, deps: [ HttpEvents, HttpPluginsToken ] },
        { provide: RequestDefaultOptionsToken, useValue: defaultRequest },
        { provide: DefaultOptionsToken, useValue: defaultResponse },
        HttpCordovaPlugin,
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
    useClass: CancelRequestPlugin,
    multi: true
  },
  {
    provide: HttpPluginsToken,
    useClass: ParseResponsePlugin,
    deps: [ ParseResponseToken ],
    multi: true
  }
];
