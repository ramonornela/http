import { Response } from '@angular/http';
import { Transform } from '../transform';
import { ModelBase } from './model-base';

export class ModelCollection extends ModelBase implements Transform {

    constructor(model: any, private rootProperty?: string) {
      super(model);
    }

    transform(data: Response) {
      data = data.json();

      if (this.rootProperty) {
        data = this.getDataRoot(data, this.rootProperty);
      }

      if (!Array.isArray(data)) {
        throw new Error(`Returns should be Array`);
      }

      let results = [];
      for (let i = 0, length = data.length; i < length; i++) {
          results.push(new this.model(data[i]));
      }

      return results;
    }
}
