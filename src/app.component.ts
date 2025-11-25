import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoadingOverlayComponent } from '@/core/components/loading-overlay/loading-overlay.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule, LoadingOverlayComponent],
    template: `
        <router-outlet></router-outlet>
        <app-loading-overlay></app-loading-overlay>
    `
})
export class AppComponent {}
