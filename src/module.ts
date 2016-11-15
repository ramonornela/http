import { NgModule, ModuleWithProviders, APP_INITIALIZER, OpaqueToken, SkipSelf, Optional } from '@angular/core';
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

export const HttpPluginsTempToken = new OpaqueToken('HTTPPLUGINSTEMP');
export const DefaultPluginToken = new OpaqueToken('DEFAULTPLUGINTEMP');

@NgModule()
export class HttpModule {

  constructor(@Optional() @SkipSelf() parentModule: HttpModule) {
    if (parentModule) {
      throw new Error('HttpModule already loaded; Import in root module only.');
    }
  }

  static initialize(defaultPlugin: any, plugins?: any): ModuleWithProviders {
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
        { provide: HttpPluginsTempToken, useValue: plugins },
        { provide: DefaultPluginToken, useValue: defaultPlugin },
        { provide: APP_INITIALIZER, useFactory: setupPlugins, deps: [ DefaultPluginToken,  HttpPluginsTempToken ], multi: true }
      ]
    };
  }
}

export function setupPlugins(defaultPlugin: any, plugins?: any) {
  return function() {
    plugins = plugins || [];
    let pluginsProviders = [];

    if (defaultPlugin === true) {
      plugins.unshift([ ParseResponsePlugin, [ ParseResponseToken ] ]);
    }

    for (let i = 0, length = plugins.length; i < length; i++) {
      pluginsProviders.push({
        provide: HttpPluginsToken,
        useClass: plugins[i][0],
        deps: plugins[i][1] || [],
        multi: true
      });
    }

    return pluginsProviders;
  }
}
