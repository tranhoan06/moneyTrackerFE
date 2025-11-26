import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { clearState } from '../store/app.action';

/**
 * Auth Service
 * Quản lý authentication và token
 */
@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly TOKEN_KEY = 'token';
    private readonly TOKEN_EXPIRY_KEY = 'token_expiry';
    private readonly REFRESH_TOKEN_KEY = 'refresh_token';
    private store = inject(Store);

    /**
     * Lấy token từ storage
     */
    getToken(): string | null {
        return sessionStorage.getItem(this.TOKEN_KEY);
    }

    /**
     * Lưu token vào storage
     */
    setToken(token: string, rememberMe: boolean = false, expiresIn?: number): void {

        sessionStorage.setItem(this.TOKEN_KEY, token);
        if (expiresIn) {
            const expiryTime = Date.now() + (expiresIn * 1000);
            sessionStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
        }
    }

    /**
     * Lưu refresh token vào storage
     */
    setRefreshToken(refreshToken: string, rememberMe: boolean = false): void {
        sessionStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }

    /**
     * Lấy refresh token từ storage
     */
    getRefreshToken(): string | null {
        return sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
    }

    /**
     * Xóa token khỏi storage
     */
    removeToken(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
        sessionStorage.removeItem(this.TOKEN_KEY);
        sessionStorage.removeItem(this.TOKEN_EXPIRY_KEY);
        sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
        this.store.dispatch(clearState());
    }

    /**
     * Kiểm tra token có tồn tại không
     */
    hasToken(): boolean {
        return !!this.getToken();
    }

    /**
     * Kiểm tra token có hết hạn không
     */
    isTokenExpired(): boolean {
        const token = this.getToken();
        if (!token) {
            return true;
        }

        // Kiểm tra expiry time từ storage
        const expiryTime = sessionStorage.getItem(this.TOKEN_EXPIRY_KEY);

        if (expiryTime) {
            const expiry = parseInt(expiryTime, 10);
            if (Date.now() >= expiry) {
                return true;
            }
        }

        // Nếu token là JWT, decode và kiểm tra exp claim
        try {
            const payload = this.decodeJwtToken(token);
            if (payload && payload.exp) {
                const expiry = payload.exp * 1000; // Convert to milliseconds
                if (Date.now() >= expiry) {
                    return true;
                }
            }
        } catch (error) {
            // Nếu không phải JWT hoặc không decode được, giả sử token hợp lệ
            console.warn('Could not decode token:', error);
        }

        return false;
    }

    /**
     * Kiểm tra user đã đăng nhập chưa (có token và token chưa hết hạn)
     */
    isAuthenticated(): boolean {
        return this.hasToken() && !this.isTokenExpired();
    }

    /**
     * Decode JWT token (base64)
     */
    private decodeJwtToken(token: string): any {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            return null;
        }
    }
}

