export class HttpException {

  private _message: string;

  private _code: number;

  private _response: any;

  constructor(message: string, code: number, response: any) {
    this._message = message;
    this._code = code;
    this._response = response;
  }

  get message() {
    return this._message;
  }

  get code() {
    return this._code;
  }

  get response() {
    return this._response;
  }
}

export class TimeoutException {
}
