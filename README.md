# HttpModule

This allow define urls Http using [url-resolver](https://github.com/ramonornela/url-resolver) to make request Http and intercept with plugins/events to analisy responses

## Using HttpModule in an Ionic 2 app

```typescript
import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';

// import configuration module
import { ConfigurationModule } from '@ramonornela/configuration';

// import url-resolver module
import { UrlResolverModule } from '@ramonornela/url-resolver';

// Import http module
import { HttpModule, DefaultPlugins } from '@ramonornela/http';

export const APP_CONFIG = {
  'urlResolver': {
    'dev': {
      '_defaults': {
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
  }
};

@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    ConfigurationModule.initialize(APP_CONFIG, 'dev')
    UrlResolverModule.initialize(),
    HttpModule.initialize(DefaultPlugins) // http module with plugin parseResponse
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ]
})
export class AppModule {}
```

Contributing

See [CONTRIBUTING.md](https://github.com/ramonornela/http/blob/master/.github/CONTRIBUTING.md)
