import { Routes } from '@angular/router';
import { DataEntryComponent } from './data-entry-component/data-entry-component';

export default [
    { path: 'data-entry', component: DataEntryComponent },
    // { path: 'crud', component: Crud },
    // { path: 'empty', component: Empty },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
