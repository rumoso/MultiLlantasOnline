import { Injectable } from '@angular/core';
import { HammerGestureConfig } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class MyHammerConfig extends HammerGestureConfig {
  override overrides = {
    swipe: { direction: 31 } // Habilita swipe en todas las direcciones
  };
}
