import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Auth Guard
 * Bảo vệ routes - chỉ cho phép truy cập nếu đã đăng nhập (có token và token chưa hết hạn)
 * Nếu chưa đăng nhập hoặc token hết hạn, redirect về /login
 */
export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Kiểm tra authentication
    if (authService.isAuthenticated()) {
        return true;
    }

    // Nếu chưa đăng nhập hoặc token hết hạn, xóa token và redirect về login
    authService.removeToken();
    
    // Lưu URL hiện tại để redirect lại sau khi login
    const returnUrl = state.url;
    router.navigate(['/login'], { 
        queryParams: { returnUrl: returnUrl !== '/' ? returnUrl : undefined }
    });
    
    return false;
};

/**
 * Guest Guard (ngược lại với Auth Guard)
 * Chỉ cho phép truy cập nếu chưa đăng nhập (dùng cho login/register pages)
 * Nếu đã đăng nhập, redirect về trang chủ
 */
export const guestGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Nếu đã đăng nhập, redirect về trang chủ
    if (authService.isAuthenticated()) {
        router.navigate(['/']);
        return false;
    }

    return true;
};

