import { Routes } from '@angular/router';
import { DataEntryComponent } from './data-entry-component/data-entry-component';
import { Calendar } from './calendar/calendar';

export default [
    { path: 'data-entry', component: DataEntryComponent },
    { path: 'calendar', component: Calendar },
    // { path: 'crud', component: Crud },
    // { path: 'empty', component: Empty },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
