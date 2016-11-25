import { Transform } from './transform';

export class Mapper {

  private _transform: Transform;

  private constructor(transform: Transform) {
    this._transform = transform;
  }

  static create(transform: any, ...args: Array<any>) {
    let instance = Object.create(transform.prototype);
    instance.constructor.apply(instance, args);
    return new Mapper(<Transform>instance);
  }

  getTransform() {
    return this._transform;
  }

  transform(data: any) {
    return this._transform.transform(data);
  }
}
