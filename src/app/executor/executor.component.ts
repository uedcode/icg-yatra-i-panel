import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-executor',
  template: `
    <div class="page">
      <div class="page-main">
        <app-header></app-header>
        <app-executor-sidebar></app-executor-sidebar>
        <div class="app-content">
          <div class="side-app">
            <router-outlet></router-outlet>
          </div>
        </div>
        <app-footer></app-footer>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ExecutorComponent {}
