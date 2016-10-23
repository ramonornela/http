import { Injectable } from '@angular/core';

@Injectable()
export abstract class Plugin {
  abstract getName(): string;
  abstract getPriority(): number;
  abstract preRequest(req?: any): boolean | void;
  abstract postRequest(resp?: any): boolean | void;
}
