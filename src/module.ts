import { NgModule, ModuleWithProviders } from '@angular/core';
import { Http as HttpAngular, BrowserXhr, ResponseOptions, XSRFStrategy, ConnectionBackend } from '@angular/http';
import { UrlResolverModule } from '@ramonornela/url-resolver';
import { Events, LoadingController } from 'ionic-angular';
import { XHRBackend } from './backend/xhr_backend';
import { Http } from './http';
import {
  Plugins,
  HttpPluginsToken,
  LoadingIonicPlugin,
  NoConnectionMobilePlugin,
  ParseResponsePlugin,
  ParseResponseToken,
  ThrowExceptionStatus,
  ThrowExceptionStatusToken
} from './plugins';

export function xhrBackendFactory(
  browserXhr: BrowserXhr,
  responseOptions: ResponseOptions,
  xsrf: XSRFStrategy,
  events: Events) {
  return new XHRBackend(browserXhr, responseOptions, xsrf, events);
}

@NgModule({
  imports: [
    UrlResolverModule
  ]
})
export class HttpModule {
  static initialize(defaults: any, plugins?: any): ModuleWithProviders {

    plugins = plugins || [];

    if (defaults === true) {
      plugins.unshift(NoConnectionMobilePlugin, [ LoadingIonicPlugin, LoadingController ], [ ParseResponsePlugin, ParseResponseToken ]);
    } else if (defaults !== false) {
      plugins = defaults;
    }

    let xhrDeps = [ BrowserXhr, ResponseOptions, XSRFStrategy, Events ];
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
