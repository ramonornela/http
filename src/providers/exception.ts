export class HttpException extends Error {

  constructor(message: string, private _code: number) {
    super(message);
  }

  get code() {
    return this._code;
  }
}

export class TimeoutException {
}
