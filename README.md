# HttpModule

This allow define urls Http using [url-resolver](https://github.com/ramonornela/url-resolver) to make request Http and intercept with plugins/events to analisy responses

## Using HttpModule in an Ionic 2 app

```typescript
import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';

// import config token
import { ConfigToken } from '@ramonornela/configuration';

// import url-resolver
import { UrlResolverModule } from '@ramonornela/url-resolver';

// Import http module
import { HttpModule } from '@ramonornela/http';

export const APP_CONFIG = {
  'urlResolver': {
    '__defines__': {
      'host': 'http://api.example.com/'
    },
    'user': {
      'url': 'user/{id}',
      'method': 'GET',
      'headers': {
        'content-type': 'application/json'
      },
      'params': {
        'id': {
          'type': 'number',
          'required': true
        }
      }
    }
  }
};

@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    UrlResolverModule,
    HttpModule.initialize(true) // http module with plugin parseResponse
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    { provide: ConfigToken, useValue: APP_CONFIG },
  ]
})
export class AppModule {}
```

Contributing

See [CONTRIBUTING.md](https://github.com/ramonornela/http/blob/master/.github/CONTRIBUTING.md)
