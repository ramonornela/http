import { Mapper } from './mapper/mapper';

export interface Options {
  timeout?: number;
  mapper?: Mapper;
  retry?: boolean;
  pluginsOptions?: {[key: string]: {[key: string]: any}};
}
