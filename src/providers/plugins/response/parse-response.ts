import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

@Injectable()
export abstract class ParseResponse {
  abstract parse(response: Response): void;
}
