import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { HttpClient } from '@angular/common/http';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { CommonService } from '@/core/services/common-service';
import { Country } from '@/core/model/country.model';
import { AuthenService } from '@/layout/service/auth-service';

@Component({
  selector: 'app-register-component',
  standalone: true,
  imports: [CommonModule, ButtonModule, InputTextModule, PasswordModule, ReactiveFormsModule, RouterModule, SelectModule, DatePickerModule, ToastModule, ProgressSpinnerModule],
  providers: [MessageService],
  templateUrl: './register-component.html',
  styleUrl: './register-component.scss'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading: boolean = false;
  maxDate: Date = new Date(); // Ngày tối đa (hôm nay)

  countries: Country[] | undefined;

  constructor(
    private http: HttpClient,
    private router: Router,
    private commonService: CommonService,
    private fb: FormBuilder,
    private authService: AuthenService,
    private messageService: MessageService
  ) {
    this.initForm();
  }

  initForm() {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      dob: [null],
      nationality: [null, Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Custom validator để kiểm tra password và confirmPassword khớp
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  // Getter để dễ truy cập form controls
  get f() {
    return this.registerForm.controls;
  }

  ngOnInit() {
    // Lấy danh sách quốc gia
    this.getAllCointries();
  }

  // Lấy ds các quốc gia
  getAllCointries() {
    this.commonService.getCountries().subscribe({
      next: (data: any) => {
        this.countries = data;
      },
      error: (error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: "Lỗi",
          detail: error?.message
        });
      }
    });
  }

  onRegister() {
    // Mark all fields as touched để hiển thị lỗi
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
    }

    this.isLoading = true;
    const formValue = this.registerForm.value;

    // Format dob nếu có
    const dob = formValue.dob ? new Date(formValue.dob).toISOString().split('T')[0] : '';

    // Call API đăng ký
    const addUserRequest = {
      name: formValue.username,
      email: formValue.email,
      password: formValue.password,
      dob: dob,
      nationality: formValue.nationality?.cca2
    };

    this.authService.addUser(addUserRequest).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Thành công',
          detail: response?.message
        });
        // Redirect về login sau 1.5 giây
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: "Lỗi",
          detail: error?.message || 'Đăng ký thất bại. Vui lòng thử lại!'
        });
      }
    });
  }
}

