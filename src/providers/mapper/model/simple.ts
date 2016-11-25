import { Response } from '@angular/http';
import { Transform } from '../transform';
import { ModelBase } from './model-base';

export class Simple extends ModelBase implements Transform {

    constructor(model: any, private rootProperty?: string) {
      super(model);
    }

    transform(data: Response) {
      data = data.json();

      if (this.rootProperty) {
        data = this.getDataRoot(data, this.rootProperty);
      }

      if (typeof data !== 'object') {
        throw new Error(`Returns should be object`);
      }

      return new this.model(data);
    }
}
