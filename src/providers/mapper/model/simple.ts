import { Response } from '@angular/http';
import jp from '@ramonornela/jsonpath';
import { Transform } from '../transform';

export class ModelSimple implements Transform {

    constructor(private model: any, private path?: string) {
      if (typeof this.model !== 'object' && this.model === null) {
        throw new Error('Data type model invalid');
      }
    }

    transform(data: Response) {
      let result = data.json();

      if (this.path) {
        result = jp.query(result, this.path)[0];
      }

      if (typeof result !== 'object') {
        throw new Error(`Returns should be object`);
      }

      return new this.model(result);
    }
}
