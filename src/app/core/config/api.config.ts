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
    baseUrlDev: 'http://localhost:8080',

    baseUrlProd: 'https://api.example.com',

    get baseUrl(): string {
        return isDevelopment ? this.baseUrlDev : this.baseUrlProd;
    },

    timeout: 30000,

    autoAddBaseUrl: true,

    allowOverride: true
};

