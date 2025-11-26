import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../config/api.config';
import { AuthService } from './auth.service';

/**
 * Token Refresh Service
 * Quản lý việc refresh token và tránh multiple concurrent refresh requests
 */
@Injectable({
    providedIn: 'root'
})
export class TokenRefreshService {
    private apiUrl = API_CONFIG.baseUrl;
    private refreshTokenInProgress$ = new BehaviorSubject<boolean>(false);
    private refreshTokenSubject$ = new BehaviorSubject<string | null>(null);

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {}
    
    refreshAccessToken(): Observable<string> {
        // Nếu đang refresh, trả về token mới khi có
        if (this.refreshTokenInProgress$.value) {
            return this.refreshTokenSubject$.pipe(
                switchMap((token) => {
                    if (token) {
                        return of(token);
                    }
                    return throwError(() => new Error('Token refresh failed'));
                })
            );
        }

        const refreshToken = this.authService.getRefreshToken();
        if (!refreshToken) {
            return throwError(() => new Error('No refresh token available'));
        }

        // Đánh dấu đang refresh
        this.refreshTokenInProgress$.next(true);
        this.refreshTokenSubject$.next(null);

        const url = `${this.apiUrl}/auth/refresh`;
        return this.http.post<any>(url, { refreshToken }).pipe(
            tap((response) => {
                const newAccessToken = response?.data?.accessToken || response?.accessToken;
                const newRefreshToken = response?.data?.refreshToken || response?.refreshToken;

                if (newAccessToken) {
                    // Lưu token mới
                    let expiresIn: number | undefined;
                    try {
                        const payload = this.decodeJwtToken(newAccessToken);
                        if (payload && payload.exp) {
                            expiresIn = payload.exp - Math.floor(Date.now() / 1000);
                        }
                    } catch (error) {
                    }

                    // Xác định rememberMe từ refreshToken storage (vì token có thể đã hết hạn)
                    const rememberMe = !!localStorage.getItem('refresh_token');
                    this.authService.setToken(newAccessToken, rememberMe, expiresIn);

                    // Lưu refresh token mới nếu có
                    if (newRefreshToken) {
                        this.authService.setRefreshToken(newRefreshToken, rememberMe);
                    }

                    // Thông báo token mới đã sẵn sàng
                    this.refreshTokenSubject$.next(newAccessToken);
                } else {
                    throw new Error('No access token in refresh response');
                }
            }),
            switchMap((response) => {
                const newAccessToken = response?.data?.accessToken || response?.accessToken;
                if (newAccessToken) {
                    return of(newAccessToken);
                }
                return throwError(() => new Error('No access token in refresh response'));
            }),
            catchError((error) => {
                // Nếu refresh thất bại, xóa tất cả tokens
                this.authService.removeToken();
                this.refreshTokenInProgress$.next(false);
                this.refreshTokenSubject$.next(null);
                return throwError(() => error);
            }),
            tap(() => {
                // Hoàn thành refresh
                this.refreshTokenInProgress$.next(false);
            })
        );
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

