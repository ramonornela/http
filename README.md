# HttpModule

This allow define urls Http using [url-resolver](https://github.com/ramonornela/url-resolver) to make request Http and intercept with plugins/events to analisy responses

## Using your module in an Ionic 2 app

```typescript
import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';

// Import http module
import { HttpModule } from '@ramonornela/http';

export const APP_ROUTES = {

};

@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    IonicModule.forRoot(MyApp),

    HttpModule.initialize(true) // Put your module here
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    { provide: ConfigToken, useValue: APP_ROUTES },
  ]
})
export class AppModule {}
```

Contributing

See [CONTRIBUTING.md](https://github.com/ramonornela/http/blob/master/.github/CONTRIBUTING.md)
