import { Response } from '@angular/http';
import { Transform } from '../transform';
import jp from 'jsonpath';

export class ModelCollection implements Transform {

    constructor(private model: any, private path?: string) {
      if (typeof this.model !== 'object' && this.model === null) {
        throw new Error('Data type model invalid');
      }
    }

    transform(data: Response) {
      let result = data.json();

      if (this.path) {
        result = jp.query(data, this.path);
      }

      if (!Array.isArray(data)) {
        throw new Error(`Returns should be Array`);
      }

      let models = [];
      for (let i = 0, length = result.length; i < length; i++) {
          models.push(new this.model(result[i]));
      }

      return models;
    }
}
