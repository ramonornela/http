import { Mapper } from './mapper/mapper';

export interface Options {
  timeout?: number;
  mapper?: Mapper;
  pluginsOptions?: {[key: string]: {[key: string]: any}};
}
