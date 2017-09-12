import { Injectable } from '@angular/core';

/**
 * Code copy https://github.com/driftyco/ionic/blob/master/src/util/events.ts
 * No need immport all ionic
 */
@Injectable()
export class Events {
  private channels: Array<any> = [];

  /**
   * Subscribe to an event topic. Events that get posted to that topic will trigger the provided handler.
   *
   * @param {string} topic the topic to subscribe to
   * @param {function} handler the event handler
   */
  subscribe(topic: string, ...handlers: Function[]) {
    if (!this.channels[topic]) {
      this.channels[topic] = [];
    }
    handlers.forEach((handler) => {
      this.channels[topic].push(handler);
    });
  }

  /**
   * Unsubscribe from the given topic. Your handler will no longer receive events published to this topic.
   *
   * @param {string} topic the topic to unsubscribe from
   * @param {function} handler the event handler
   *
   * @return true if a handler was removed
   */
  unsubscribe(topic: string, handler: Function = null) {
    let t = this.channels[topic];
    if (!t) {
      // Wasn't found, wasn't removed
      return false;
    }

    if (!handler) {
      // Remove all handlers for this topic
      delete this.channels[topic];
      return true;
    }

    // We need to find and remove a specific handler
    let i = t.indexOf(handler);

    if (i < 0) {
      // Wasn't found, wasn't removed
      return false;
    }

    t.splice(i, 1);

    // If the channel is empty now, remove it from the channel map
    if (!t.length) {
      delete this.channels[topic];
    }

    return true;
  }

  /**
   * Publish an event to the given topic.
   *
   * @param {string} topic the topic to publish to
   * @param {any} eventData the data to send as the event
   */
  publish(topic: string, ...args: any[]) {
    var t = this.channels[topic];
    if (!t) {
      return null;
    }

    let responses: any[] = [];
    t.forEach((handler: any) => {
      responses.push(handler.apply(null, args));
    });
    return responses;
  }
}

export class HttpEvents extends Events {

  static PRE_REQUEST: string = 'http.prerequest';
  static POST_REQUEST: string = 'http.postrequest';
  static POST_REQUEST_SUCCESS: string = 'http.postrequest_success';
  static POST_REQUEST_ERROR: string = 'http.postrequest_error';

  constructor() {
    super();
  }

  preRequest(req: Request, subscribe: any) {
    this.publish(HttpEvents.PRE_REQUEST, req, subscribe);
  }

  postRequest(resp: Response) {
    this.publish(HttpEvents.POST_REQUEST, resp);
  }

  postRequestSuccess(resp: Response) {
    this.publish(HttpEvents.POST_REQUEST_SUCCESS, resp);
  }

  postRequestError(resp: Response) {
    this.publish(HttpEvents.POST_REQUEST_ERROR, resp);
  }

  onPreRequest(callback: (req?: any) => any) {
    this.subscribe(HttpEvents.PRE_REQUEST, callback);
  }

  onPostRequest(callback: (req?: any, subscribe?: any) => any) {
    this.subscribe(HttpEvents.POST_REQUEST, callback);
  }

  onPostRequestSuccess(callback: (req?: any) => any) {
    this.subscribe(HttpEvents.POST_REQUEST_SUCCESS, callback);
  }

  onPostRequestError(callback: (req?: any) => any) {
    this.subscribe(HttpEvents.POST_REQUEST_ERROR, callback);
  }
}
