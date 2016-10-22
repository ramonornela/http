// @todo essas exceptions devem ficar em facade
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

export class NoConnectionException {

  constructor(private message: string) {
  }

  getMessage() {
    return this.message;
  }
}
