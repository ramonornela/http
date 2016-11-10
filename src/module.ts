import { NgModule, ModuleWithProviders } from '@angular/core';
import { UrlResolverModule } from '@ramonornela/url-resolver';
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

@NgModule({
  imports: [
    UrlResolverModule
  ]
})
export class HttpModule {

  static initialize(defaultPlugin: boolean | Array<any>, plugins?: Array<any>): ModuleWithProviders {
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
        pluginsProviders
      ]
    };
  }
}
