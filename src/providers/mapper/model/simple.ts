import { Response } from '@angular/http';
import { Transform } from '../transform';
import jp from 'jsonpath';

export class ModelSimple implements Transform {

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

      if (typeof result[0] !== 'object') {
        throw new Error(`Returns should be object`);
      }

      return new this.model(result[0]);
    }
}
