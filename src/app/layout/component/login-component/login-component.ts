import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { HttpClient } from '@angular/common/http';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AuthService } from '@/core/services/auth.service';
import { AuthenService } from '@/layout/service/auth-service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [CommonModule, DividerModule, ButtonModule, InputTextModule, PasswordModule, CheckboxModule, ReactiveFormsModule, RouterModule, ToastModule, ProgressSpinnerModule],
  providers: [MessageService],
  templateUrl: './login-component.html',
  styleUrl: './login-component.scss'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading: boolean = false;
  returnUrl: string = '/';

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private authService2: AuthenService,
    private messageService: MessageService,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  initForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }

  // Getter để dễ truy cập form controls
  get f() {
    return this.loginForm.controls;
  }

  // Decode JWT token để lấy thông tin expiry
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

  ngOnInit() {
    // Lấy returnUrl từ query params
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onLogin() {
    // Mark all fields as touched để hiển thị lỗi
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    const formValue = this.loginForm.value;

    this.authService2.login({ email: formValue.email, password: formValue.password }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        
        // Lấy token từ response.data.accessToken
        const accessToken = response?.data?.accessToken;
        const refreshToken = response?.data?.refreshToken;
        
        if (accessToken) {
          let expiresIn: number | undefined;
          try {
            const payload = this.decodeJwtToken(accessToken);
            if (payload && payload.exp) {
              expiresIn = payload.exp - Math.floor(Date.now() / 1000);
            }
          } catch (error) {
            console.warn('Could not decode token for expiry:', error);
          }
          
          // Lưu accessToken
          this.authService.setToken(accessToken, formValue.rememberMe, expiresIn);
          
          // Lưu refreshToken nếu có
          if (refreshToken) {
            this.authService.setRefreshToken(refreshToken, formValue.rememberMe);
          }
        }
        
        this.messageService.add({
          severity: 'success',
          summary: 'Thành công',
          detail: response?.message || 'Đăng nhập thành công!'
        });
        // Redirect về trang đã yêu cầu sau 1.5 giây
        setTimeout(() => {
          this.router.navigate([this.returnUrl]);
        }, 1500);
      },
      error: (error: any) => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: "Lỗi",
          detail: error?.message || 'Đăng nhập thất bại. Vui lòng thử lại!'
        });
      }
    });
  }
}
