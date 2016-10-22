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
    let pluginConf: any = {};

    pluginConf[plugin.getName()] = plugin;

    if (!priority) {
      priority = plugin.getPriority();
    }

    this.plugins.splice(priority, 0, pluginConf);
    return this;
  }

  get(name: string): Plugin | void {
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
        return ++index;
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
