import { NgModule, ModuleWithProviders } from '@angular/core';
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
  ]
})
export class HttpModule {
  static initialize(plugins?: any): ModuleWithProviders {

    plugins = plugins || [];
    plugins.unshift([ ParseResponsePlugin, ParseResponseToken ]);

    let pluginsProviders = [];

    // adicionando array de plugins
    for (let plugin of plugins) {
      let deps: any = [];

      if (plugin.constructor.name === 'Array') {
        deps = plugin;
        plugin = plugin.shift();
      }
      pluginsProviders.push({provide: HttpPluginsToken, useClass: plugin, deps: deps, multi: true});
    }

    return {
      ngModule: HttpModule,
      providers: [
        HttpEvents,
        {
          provide: ConnectionBackend,
          useFactory: xhrBackendFactory,
          deps: [ BrowserXhr, ResponseOptions, XSRFStrategy, HttpEvents ]
        },
        HttpAngular,
        pluginsProviders,
        { provide: ThrowExceptionStatusToken, useValue: null },
        { provide: ParseResponseToken, useClass: ThrowExceptionStatus, deps: [ ThrowExceptionStatusToken ], multi: true },
        { provide: Plugins, useClass: Plugins, deps: [ HttpPluginsToken ] },
        Http
      ]
    };
  }
}
