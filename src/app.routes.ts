import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app-component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Notfound } from './app/pages/notfound/notfound';
import { LoginComponent } from '@/layout/component/login-component/login-component';
import { RegisterComponent } from '@/layout/component/register-component/register-component';
import { authGuard, guestGuard } from '@/core/guards/auth.guard';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        canActivate: [authGuard], // Bảo vệ toàn bộ AppLayout và các children
        children: [
            { path: '', component: Dashboard },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
        ]
    },
    { path: 'notfound', component: Notfound },
    { path: 'login', component: LoginComponent, canActivate: [guestGuard] }, // Chỉ cho phép nếu chưa đăng nhập
    { path: 'register', component: RegisterComponent, canActivate: [guestGuard] }, // Chỉ cho phép nếu chưa đăng nhập
    { path: '**', redirectTo: '/notfound' }
];
