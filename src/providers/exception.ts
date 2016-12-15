export class HttpException {

  private _message: string;

  private _code: number;

  constructor(message: string, code: number) {
    this._message = message;
    this._code = code;
  }

  get message() {
    return this._message;
  }

  get code() {
    return this._code;
  }
}

export class TimeoutException {
}
