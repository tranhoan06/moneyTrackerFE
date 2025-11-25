import { Component, OnInit } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../../service/layout.service';
import { TieredMenu } from 'primeng/tieredmenu';
import { ButtonModule } from 'primeng/button';
import { itemsList } from '../model/menu-action-user.model';
import { AuthenService } from '@/layout/service/auth-service';
import { Toast, ToastModule } from 'primeng/toast';
import { AuthService } from '@/core/services/auth.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, AppConfigurator, TieredMenu, ButtonModule, ToastModule],
    providers: [MessageService],
    templateUrl: './app.topbar.html'
})
export class AppTopbar implements OnInit {
    items: MenuItem[] = itemsList;
    returnUrl: string = '/login';

    constructor(
        public layoutService: LayoutService,
        private authService: AuthenService,
        private authServiceCore: AuthService,
        private messageService: MessageService,
        private router: Router,
    ) { }

    ngOnInit() {
        this.items = this.items.map(item => ({
            ...item,
            command: (event: any) => {
                this.onMenuSelect(event);
            }
        }));
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    onMenuSelect(event: any) {
        const selectedItem: MenuItem = event.item;
        console.log('Menu item selected:', selectedItem);

        if (selectedItem.id === '16') {
            this.handleLogout();
        } else if (selectedItem.id === '0') {
            // Tài khoản
            this.handleAccount();
        }
    }

    private handleLogout() {
        // Xử lý đăng xuất
        this.authService.logout().subscribe({
            next: (response: any) => {
                // Xóa token ở client
                this.authServiceCore.removeToken();
                
                this.messageService.add({
                    severity: 'success',
                    summary: 'Thành công',
                    detail: response?.message || 'Đăng xuất thành công!'
                });
                
                // Redirect về login sau 1.5 giây
                setTimeout(() => {
                    this.router.navigate([this.returnUrl]);
                }, 1500);
            },
            error: (err: any) => {
                console.log('Logout error details:', {
                    status: err?.status,
                    message: err?.message,
                    error: err?.error,
                    errorType: err?.error?.constructor?.name
                });
                
                // Kiểm tra nếu là lỗi CORS
                // Status 0, không có status, hoặc TypeError: Failed to fetch thường là CORS error
                const isCorsError = err?.status === 0 || 
                                   !err?.status ||
                                   err?.message?.includes('CORS') || 
                                   err?.message?.includes('Failed to fetch') ||
                                   err?.message?.includes('Http failure response') ||
                                   err?.error?.message?.includes('CORS') ||
                                   err?.error?.message?.includes('Failed to fetch') ||
                                   (err?.error instanceof TypeError) ||
                                   (err?.error?.constructor?.name === 'TypeError');
                
                console.log('Is CORS error:', isCorsError);
                
                // Vẫn xóa token ở client dù có lỗi (đặc biệt là CORS)
                this.authServiceCore.removeToken();
                
                if (isCorsError) {
                    // Nếu là lỗi CORS, vẫn hiển thị thông báo info và redirect
                    // Vì token đã được xóa ở client, user vẫn logout được
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Thông báo',
                        detail: 'Đã đăng xuất. Lưu ý: Có thể không xóa được session trên server do lỗi CORS.'
                    });
                    
                    setTimeout(() => {
                        this.router.navigate([this.returnUrl]);
                    }, 1500);
                } else {
                    // Nếu là lỗi khác, hiển thị cảnh báo nhưng vẫn redirect
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Cảnh báo',
                        detail: err?.message || 'Đăng xuất không thành công, nhưng đã xóa session ở client!'
                    });
                    
                    setTimeout(() => {
                        this.router.navigate([this.returnUrl]);
                    }, 2000);
                }
            }
        });
    }

    private handleAccount() {

    }
}
