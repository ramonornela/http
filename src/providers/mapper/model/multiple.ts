import { Response } from '@angular/http';
import { Transform } from '../transform';
import { ModelBase } from './model-base';
import { Mapper } from '../mapper';
import { ModelSimple } from './simple';
import { ModelCollection } from './collection';

export const TypeModel = {
  Simple: 'simple',
  Collection: 'collection',
}

export class ModelMultiple extends ModelBase implements Transform {

    private types: {[key: string]: any};

    constructor(private mapper: {[key: string]: MapperOptions}) {
      super();
      this.addType(TypeModel.Simple, ModelSimple)
          .addType(TypeModel.Collection, ModelCollection);
    }

    addType(type: string, model: any): this {
      this.types[type] = model;
      return this;
    }

    transform(data: Response) {
      let results: any;

      for (let key in this.mapper) {
        if (!this.types[this.mapper[key].type]) {
          const typeException = this.mapper[key].type;
          throw new Error(`Type ${typeException} not exits`);
        }

        let model = this.mapper[key].model;
        let rootProperty = this.mapper[key].rootProperty;
        let type = this.types[this.mapper[key].type];
        results[key] = Mapper.create(type, model, rootProperty);
      }

      return results;
    }
}

export interface MapperOptions {
  type: string;
  model: any;
  rootProperty?: string;
}
