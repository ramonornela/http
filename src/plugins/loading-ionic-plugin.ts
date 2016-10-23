import { Injectable } from '@angular/core';
import { PreRequestPlugin, PostRequestPlugin } from './plugin';
import { LoadingController } from 'ionic-angular';

@Injectable()
export class LoadingIonicPlugin implements PreRequestPlugin, PostRequestPlugin {

  protected loading;

  protected allow: boolean = true;

  protected loadingOptions: Object = {};

  protected originalLoadingOptions: Object;

  constructor(private loadingController: LoadingController) {}

  getPriority(): number {
    return 0;
  }

  getName() {
    return 'loading-ionic';
  }

  preRequest() {
    this.originalLoadingOptions = Object.assign({}, this.loadingOptions);
    if (this.allow) {
      this.getLoading().present();
    }
  }

  postRequest() {
    if (this.allow && this.loading) {
      this.loading.dismiss();
    }

    // reset values
    this.loading = null;
    this.loadingOptions = this.originalLoadingOptions;
    this.allow = true;
  }

  disableLoading(): this {
    this.allow = false;
    return this;
  }

  enableLoading(): this {
    this.allow = true;
    return this;
  }

  setLoadingOptions(loading: Object): this {
    this.loadingOptions = loading;
    return this;
  }

  protected getLoading() {
    if (!this.loading) {
      this.loading = this.loadingController.create(this.loadingOptions);
    }

    return this.loading;
  }
}
