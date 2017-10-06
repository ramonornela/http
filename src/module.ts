import { ModuleWithProviders, NgModule } from '@angular/core';
import { BrowserXhr, ResponseOptions, XSRFStrategy } from '@angular/http';
import { HTTP } from '@ionic-native/http';
import {
  CancelRequestPlugin,
  DefaultOptionsToken,
  Events,
  Http,
  HttpCordovaPlugin,
  HttpEvents,
  HttpPluginBackend,
  httpPluginBackendFactory,
  HttpPluginsToken,
  ParseResponsePlugin,
  ParseResponseToken,
  Plugins,
  RequestDefaultOptionsToken,
  ThrowExceptionStatus,
  ThrowExceptionStatusToken,
  XHRBackend,
  xhrBackendFactory
} from './providers';

@NgModule()
export class HttpModule {

  static initialize(plugins: Array<TypePlugins>, defaultRequest?: any, defaultResponse?: any): ModuleWithProviders {
    return {
      ngModule: HttpModule,
      providers: [
        Events,
        HttpEvents,
        {
          provide: XHRBackend,
          useFactory: xhrBackendFactory,
          deps: [ BrowserXhr, ResponseOptions, XSRFStrategy, HttpEvents ]
        },
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

  static initialize(plugins: Array<TypePlugins>, defaultRequest?: any, defaultResponse?: any): ModuleWithProviders {
    return {
      ngModule: HttpCordovaPluginModule,
      providers: [
        Events,
        HttpEvents,
        HTTP,
        {
          provide: HttpPluginBackend,
          useFactory: httpPluginBackendFactory,
          deps: [ HTTP, HttpEvents ]
        },
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
