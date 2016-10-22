import { Injectable } from '@angular/core';
import { Plugin } from './plugin';
import { Network } from 'ionic-native';
import { NoConnectionException } from '../exception';

@Injectable()
export class NoConnectionMobilePlugin implements Plugin {

  getPriority(): number {
    return -1;
  }

  getName() {
    return 'no-connection-mobile';
  }

  preRequest() {
    if (Network.connection === 'none') {
      throw new NoConnectionException('sem conexao');
    }
  }

  postRequest() {}
}
