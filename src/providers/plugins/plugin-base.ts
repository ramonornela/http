abstract class PluginBase {

  protected optionsInitials: {[key: string]: any};

  constructor() {
    this.optionsInitials = this.getOptionsInitial();
  }

  protected restoreOptions() {
    this.setOptions(this.optionsInitials);
  }

  protected getOptionsInitial(): {[key: string]: any} {
    let options = {};
    for (let prop in this) {
      if (typeof this[prop] !== 'function') {
        options[prop] = this[prop];
      }
    }

    return options;
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
