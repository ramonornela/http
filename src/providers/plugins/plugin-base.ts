export abstract class PluginBase {

  protected optionsInitials: {[key: string]: any};

  constructor() {
    // workaround assign value constructor
    setTimeout(() => {
      this.optionsInitials = this.getOptionsInitial();
    });
  }

  protected getOptionsInitial(): {[key: string]: any} {
    let options = {};
    let keys = Object.keys(this);
    let length = keys.length;

    for (let i =  0; i < length; i++) {
      options[keys[i]] = this[keys[i]];
    }

    return options;
  }

  restoreOptions() {
    this.setOptions(this.optionsInitials);
  }

  setOptions(options: Object): this {
    for (let option in options) {
      let method = this.normalizeMethodName(option);
      let methodsBlackList = this.getOptionsMethodsBlackList();
      if (typeof this[method] === 'function' && methodsBlackList.indexOf(method) === -1) {
        this[method].apply(this, [ options[option] ]);
      }
    }

    return this;
  }

  protected getOptionsMethodsBlackList(): Array<string> {
    return [ 'constructor', 'setOptions' ];
  }

  protected normalizeMethodName(option: string): string {
    return [
        'set',
        option.charAt(0).toUpperCase(),
        option.slice(1)
    ].join('');
  }
}
