import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { registerLocaleData } from '@angular/common';
import localeMx from '@angular/common/locales/es-MX';

// Registra el locale para español (México)
registerLocaleData(localeMx);


bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
