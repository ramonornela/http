import { Response } from '@angular/http';
import { Transform } from '../transform';
import { getDataRoot } from './util';

export class ModelCollection implements Transform {

    constructor(private model: any, private rootProperty?: string) {}

    transform(data: Response) {
      data = data.json();

      if (this.rootProperty) {
        data = getDataRoot(data, this.rootProperty);
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
