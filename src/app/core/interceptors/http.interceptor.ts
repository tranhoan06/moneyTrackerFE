import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, isDevMode } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, throwError, switchMap } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { LoadingService } from '../services/loading.service';
import { TokenRefreshService } from '../services/token-refresh.service';
import { AuthService } from '../services/auth.service';


export const httpInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const loadingService = inject(LoadingService);
    const tokenRefreshService = inject(TokenRefreshService);
    const authService = inject(AuthService);


    let baseUrl = API_CONFIG.baseUrl;
    
    const token = sessionStorage.getItem('token');

    const isExternalUrl = req.url.startsWith('http://') || req.url.startsWith('https://');
    const isAsset = req.url.startsWith('assets/') || req.url.startsWith('/assets/');
    const shouldAddBaseUrl = API_CONFIG.autoAddBaseUrl && !isExternalUrl && !isAsset && baseUrl;

    if (!isAsset) {
        loadingService.show();
    }

    const finalUrl = shouldAddBaseUrl 
        ? `${baseUrl}${req.url.startsWith('/') ? req.url : '/' + req.url}`
        : req.url;

    const headers: { [key: string]: string } = {};

    // Chỉ thêm Content-Type cho các request không phải FormData
    if (!(req.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    // Thêm Authorization header nếu có token
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Clone request và thêm headers
    let clonedRequest = req.clone({
        url: finalUrl,
        setHeaders: headers
    });
    // Xử lý response
    return next(clonedRequest).pipe(
        finalize(() => {
            // Ẩn loading spinner khi request hoàn thành (thành công hoặc lỗi)
            if (!isAsset) {
                loadingService.hide();
            }
        }),
        catchError((error: HttpErrorResponse) => {

            // Xử lý các loại lỗi khác nhau
            if (error instanceof HttpErrorResponse) {
                switch (error.status) {
                    case 401:
                        const isRefreshRequest = req.url.includes('/auth/refresh');
                        
                        if (!isRefreshRequest && authService.isTokenExpired() && authService.getRefreshToken()) {
                            return tokenRefreshService.refreshAccessToken().pipe(
                                switchMap((newToken) => {
                                    const newHeaders = { ...headers };
                                    newHeaders['Authorization'] = `Bearer ${newToken}`;
                                    
                                    const retryRequest = req.clone({
                                        url: finalUrl,
                                        setHeaders: newHeaders
                                    });
                                    return next(retryRequest);
                                }),
                                catchError((refreshError) => {
                                    authService.removeToken();
                                    router.navigate(['/login']);
                                    return throwError(() => refreshError);
                                })
                            );
                        } else {
                            authService.removeToken();
                            router.navigate(['/login']);
                        }
                        break;

                    case 403:
                        break;

                    case 404:
                        break;

                    case 500:
                    case 502:
                    case 503:
                        break;

                    default:
                        if (error.status) {}
                }
            }

            // Trả về error để component có thể xử lý
            return throwError(() => error);
        })
    );
};

