import { Injectable, OpaqueToken } from '@angular/core';
import { Plugin } from './plugin';

export const HttpPluginsToken = new OpaqueToken('HTTP_PLUGINS');

@Injectable()
export class Plugins {

  private plugins: Array<{[name: string]: Plugin}> = [];

  constructor(plugins?: Array<Plugin>) {
    if (plugins) {
      for (let plugin of plugins) {
        this.set(plugin);
      }
    }
  }

  set(plugin: Plugin, priority?: number): this {
    let methods = [ 'preRequest', 'postRequest', 'postRequestSuccess', 'postRequestError' ];

    // workaround typescript not exists verification of interfaces
    let implementsInterfaces = false;
    for (let method of methods) {
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

    this.plugins[priority] = pluginConf;
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

  getAll() {
    return this.plugins;
  }

  each(fn: (plugin: Plugin, index?: number) => boolean | void) {
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
}
