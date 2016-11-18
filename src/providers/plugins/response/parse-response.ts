import { Response } from '@angular/http';
import { Injectable } from '@angular/core';

@Injectable()
export abstract class ParseResponse {
  abstract parse(response: Response): void;
}
