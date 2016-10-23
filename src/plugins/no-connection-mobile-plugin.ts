import { Injectable } from '@angular/core';
import { PreRequestPlugin } from './plugin';
import { Network } from 'ionic-native';
import { NoConnectionException } from '../exception';

@Injectable()
export class NoConnectionMobilePlugin implements PreRequestPlugin {

  getPriority(): number {
    return -1;
  }

  getName() {
    return 'no-connection-mobile';
  }

  preRequest() {
    if (Network.connection === 'none') {
      throw new NoConnectionException('Not Connection');
    }
  }
}
