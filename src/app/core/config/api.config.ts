/**
 * API Configuration
 * Cấu hình base URL và các settings cho API calls
 * Hỗ trợ cả localhost và production API server
 */

// Kiểm tra môi trường hiện tại
const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname.includes('localhost');

export const API_CONFIG = {
    /**
     * Base URL cho API - Development (localhost)
     * Sử dụng khi chạy trên localhost
     */
    baseUrlDev: 'http://localhost:8080',

    /**
     * Base URL cho API - Production (Server)
     * Sử dụng khi deploy lên server
     */
    baseUrlProd: 'https://api.example.com',

    /**
     * Lấy base URL tự động dựa trên môi trường
     * Development -> baseUrlDev
     * Production -> baseUrlProd
     */
    get baseUrl(): string {
        return isDevelopment ? this.baseUrlDev : this.baseUrlProd;
    },

    /**
     * Timeout cho các API calls (milliseconds)
     * Mặc định: 30000 (30 giây)
     */
    timeout: 30000,

    /**
     * Có tự động thêm baseUrl vào các request không?
     * Nếu false, chỉ thêm baseUrl khi URL không bắt đầu bằng http:// hoặc https://
     */
    autoAddBaseUrl: true,

    /**
     * Cho phép override baseUrl bằng cách set trong localStorage
     * Key: 'api_base_url'
     * Ví dụ: localStorage.setItem('api_base_url', 'http://custom-api.com')
     */
    allowOverride: true
};

