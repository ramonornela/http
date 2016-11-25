import { Response } from '@angular/http';
import { Transform } from '../transform';
import { ModelBase } from './model-base';

export class ModelSimple extends ModelBase implements Transform {

    constructor(private model: any, private rootProperty?: string) {
      super();
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
