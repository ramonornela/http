import { Injectable, OpaqueToken, Optional } from '@angular/core';
import { Plugin } from './plugin';
import { HttpEvents } from '../backend/xhr_backend';

export const HttpPluginsToken = new OpaqueToken('HTTP_PLUGINS');

const EventsMethods = [ 'preRequest', 'postRequest', 'postRequestSuccess', 'postRequestError' ];

const AllPlugins = '*';

@Injectable()
export class Plugins {

  private plugins: Array<{[name: string]: Plugin}> = [];

  private options: Object = {};

  constructor(protected events: HttpEvents, @Optional() plugins: Array<Plugin>) {
    if (plugins) {
      this.set(plugins);
    }

    this.callEvent('preRequest');
    this.callEvent('postRequest');
    this.callEvent('postRequestSuccess');
    this.callEvent('postRequestError');
  }

  protected callEvent(method: string) {
    let methodName = [
      'on',
      method.charAt(0).toUpperCase(),
      method.slice(1)
    ].join('');

    this.events[methodName].call(this.events, (req: any, subscribe: any) => {
      this.runEvent(method, [ req, subscribe ]);
      if (method === 'postRequest') {
        this.cleanOptions(method);
      }
    });
  }

  set(plugins: Array<Plugin>): this {
    this.plugins = [];
    for (let plugin of plugins) {
      this.add(plugin);
    }

    return this;
  }

  add(plugin: Plugin, priority?: number): this {
    // workaround typescript not exists verification of interfaces
    let implementsInterfaces = false;
    for (let method of EventsMethods) {
      if (method in plugin) {
        implementsInterfaces = true;
      }
    }

    if (implementsInterfaces === false) {
      throw 'Plugin not implements interface of events (preRequest, postRequest ...).';
    }

    let pluginConf: any = {};

    pluginConf[plugin.getName()] = plugin;

    if (!priority) {
      priority = plugin.getPriority();
    }

    // if key exists add before pluginConfig
    if (this.plugins[priority]) {
      this.plugins.splice(priority, 0, pluginConf);
    } else {
      this.plugins[priority] = pluginConf;
    }

    this.plugins.filter((value) => value !== undefined || value !== null);

    return this;
  }

  get(name: string): Plugin | null {
    let index: number = this.indexOf(name);

    if (index !== -1) {
      return this.plugins[index][name];
    }

    return null;
  }

  has(name: string): boolean {
    return this.indexOf(name) !== -1 ? true : false;
  }

  indexOf(name: string): number {

    for (let index = 0, length = this.plugins.length; index < length; index++) {
      let plugin = this.plugins[index];
      if (plugin[name]) {
        return index;
      }
    }

    return -1;
  }

  remove(name: string): boolean {
    let index = this.indexOf(name);
    if (index !== -1) {
      this.plugins.splice(index, 1);
      return true;
    }

    return false;
  }

  getAll(): Array<{[name: string]: Plugin}> {
    return this.plugins;
  }

  forEach(fn: (plugin: Plugin, index?: number) => boolean | void) {
    let i = 0;
    for (let object of this.plugins) {
      for (let name in object) {

        let fnBreak: any = fn(object[name], i++);

        if (fnBreak === false) {
          return;
        }
      }
    }
  }

  cleanOptions(event: string) {
    this.forEach((plugin: Plugin) => {
      if ('restoreOptions' in plugin) {
        if (event && event in plugin) {
          plugin.restoreOptions();
        }
      }
      this.options[plugin.getName()] = {};
    });
  }

  setOptions(options: Object): this {
    let keys = Object.keys(options);

    if (keys.indexOf(AllPlugins) !== -1) {
      this.forEach((plugin: Plugin) => {
        if ('setOptions' in plugin) {
          plugin.setOptions(options[AllPlugins]);
        }

        this.options[plugin.getName()] = options[AllPlugins];
      });

      delete options[AllPlugins];
    }

    for (let pluginName in options) {

      if (!this.has(pluginName)) {
        throw new Error('Plugin not exists');
      }

      let plugin = this.get(pluginName);

      if ('setOptions' in plugin) {
        plugin.setOptions(options[pluginName]);
      }

      this.options[plugin.getName()] = options[pluginName];
    }

    this.options = options;
    return this;
  }

  runEvent(event: string, params: Array<any>) {
    if (EventsMethods.indexOf(event) === -1) {
      throw new Error(`Event '${event}' not exists`);
    }

    this.forEach((plugin: any) => {
      if (!(event in plugin)) {
        return;
      }

      try {
        let method  = plugin[event];
        method.apply(plugin, params);
      } catch (ex) {

        if (plugin.getThrowsException && plugin.getThrowsException()) {
          let callbackException = plugin.getThrowsException();
          if (typeof callbackException === 'function') {
            callbackException(ex);
            return;
          }
          throw ex;
        }
      }
    });
  }
}
