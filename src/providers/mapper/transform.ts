import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

@Injectable()
export abstract class Transform {
  abstract transform(data: Response);
}
