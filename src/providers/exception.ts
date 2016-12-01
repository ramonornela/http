export class HttpException {

  constructor(private message: string, private code: number) {
  }

  getCode() {
    return this.code;
  }

  getMessage() {
    return this.message;
  }
}

export class TimeoutException {
}
