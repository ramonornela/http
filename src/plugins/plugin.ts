import { Injectable } from '@angular/core';

@Injectable()
export abstract class Plugin {
  abstract getName(): string;
  abstract getPriority(): number;
  abstract preRequest(req?: any);
  abstract postRequest(resp?: any);
}
