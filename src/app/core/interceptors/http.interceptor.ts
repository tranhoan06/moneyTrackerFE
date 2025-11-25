import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, isDevMode } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, throwError } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { LoadingService } from '../services/loading.service';

/**
 * HTTP Interceptor để xử lý tất cả các API calls
 * - Thêm base URL (nếu cần)
 * - Thêm headers (Authorization, Content-Type)
 * - Xử lý errors
 * - Logging requests/responses
 */
export const httpInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const loadingService = inject(LoadingService);

    // Kiểm tra môi trường
    const isDevelopment = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1' ||
                          window.location.hostname.includes('localhost');

    // Lấy baseUrl từ config (có thể override từ localStorage)
    let baseUrl = API_CONFIG.baseUrl;
    if (API_CONFIG.allowOverride) {
        const overrideUrl = localStorage.getItem('api_base_url');
        if (overrideUrl) {
            baseUrl = overrideUrl;
        }
    }
    
    const token = localStorage.getItem('token') || sessionStorage.getItem('token'); // Lấy token từ storage

    // Kiểm tra xem URL có phải là external URL hoặc assets không
    const isExternalUrl = req.url.startsWith('http://') || req.url.startsWith('https://');
    const isAsset = req.url.startsWith('assets/') || req.url.startsWith('/assets/');
    const shouldAddBaseUrl = API_CONFIG.autoAddBaseUrl && !isExternalUrl && !isAsset && baseUrl;

    // Hiển thị loading spinner cho API calls (không phải assets)
    if (!isAsset) {
        loadingService.show();
    }

    // Xây dựng URL cuối cùng
    const finalUrl = shouldAddBaseUrl 
        ? `${baseUrl}${req.url.startsWith('/') ? req.url : '/' + req.url}`
        : req.url;

    // Chuẩn bị headers
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

    // Log request (chỉ trong development và không phải assets)
    if (!isAsset && isDevMode()) {
        const env = isDevelopment ? '🔵 DEV (localhost)' : '🟢 PROD (server)';
        console.log(`🚀 API Request [${env}]:`, {
            method: clonedRequest.method,
            url: clonedRequest.url,
            baseUrl: shouldAddBaseUrl ? baseUrl : 'none (external/asset)',
            headers: Object.keys(headers)
        });
    }

    // Xử lý response
    return next(clonedRequest).pipe(
        finalize(() => {
            // Ẩn loading spinner khi request hoàn thành (thành công hoặc lỗi)
            if (!isAsset) {
                loadingService.hide();
            }
        }),
        catchError((error: HttpErrorResponse) => {
            // Log error (chỉ cho API calls, không phải assets)
            if (!isAsset) {
                console.error('❌ API Error:', {
                    status: error.status,
                    statusText: error.statusText,
                    url: error.url,
                    message: error.message,
                    error: error.error
                });
            }

            // Xử lý các loại lỗi khác nhau
            if (error instanceof HttpErrorResponse) {
                switch (error.status) {
                    case 401:
                        // Unauthorized - xóa token và redirect về login
                        localStorage.removeItem('token');
                        sessionStorage.removeItem('token');
                        router.navigate(['/login']);
                        break;

                    case 403:
                        // Forbidden
                        console.error('Access forbidden');
                        break;

                    case 404:
                        // Not found
                        console.error('Resource not found');
                        break;

                    case 500:
                    case 502:
                    case 503:
                        // Server errors
                        console.error('Server error:', error.status);
                        break;

                    default:
                        if (error.status) {
                            console.error(`HTTP Error ${error.status}:`, error.statusText);
                        }
                }
            }

            // Trả về error để component có thể xử lý
            return throwError(() => error);
        })
    );
};

