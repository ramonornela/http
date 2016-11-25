import { Injectable } from '@angular/core';

@Injectable()
export abstract class Transform {
  abstract transform(data: any);
}
