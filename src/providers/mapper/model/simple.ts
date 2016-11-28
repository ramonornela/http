import { Response } from '@angular/http';
import { Transform } from '../transform';
import { getDataRoot } from './util';

export class ModelSimple implements Transform {

    constructor(private model: any, private rootProperty?: string) {
      if (typeof this.model !== 'object' && this.model === null) {
        throw new Error('Data type model invalid');
      }
    }

    transform(data: Response) {
      data = data.json();

      if (this.rootProperty) {
        data = getDataRoot(data, this.rootProperty);
      }

      if (typeof data !== 'object') {
        throw new Error(`Returns should be object`);
      }

      return new this.model(data);
    }
}
