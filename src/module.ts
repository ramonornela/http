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
  static initialize(defaults: any, plugins?: any): ModuleWithProviders {

    plugins = plugins || [];

    if (defaults === true) {
      plugins.unshift([ ParseResponsePlugin, ParseResponseToken ]);
    } else if (defaults !== false) {
      plugins = defaults;
    }

    let xhrDeps = [ BrowserXhr, ResponseOptions, XSRFStrategy, HttpEvents ];
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
        { provide: ConnectionBackend, useFactory: xhrBackendFactory, deps: xhrDeps },
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
