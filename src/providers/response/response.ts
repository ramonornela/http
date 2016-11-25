import { Transform } from './transform';

export class Response {

  private _transform: Transform;

  private constructor(transform: Transform) {
    this._transform = transform;
  }

  static create(transform: any, ...args: Array<any>) {
    let instance = Object.create(transform.prototype);
    instance.constructor.apply(instance, args);
    return new Response(<Transform>instance);
  }

  transform(data: any) {
    return this._transform.transform(data);
  }
}
