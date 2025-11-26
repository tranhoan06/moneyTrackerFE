import { API_CONFIG } from '@/core/config/api.config';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AddUserRequest } from '../component/model/addUser.model';

@Injectable({
  providedIn: 'root'
})
export class AuthenService {
  private apiUrl = API_CONFIG.baseUrl;
  constructor(
    private http: HttpClient
  ) { }

  // login
  login(data: { email: string; password: string }): Observable<any> {
    const url = `${this.apiUrl}/auth/login`;
    return this.http.post<any>(url, data);
  }

  // Tạo mới user
  addUser(data: AddUserRequest): Observable<any> {
    const url = `${this.apiUrl}/api/user/add`;
    return this.http.post<any>(url, data);
  }

  // logout
  logout(): Observable<void> {
    const url = `${this.apiUrl}/auth/logout`;
    return this.http.post<void>(url, {});
  }

  // get info user
  getUserByEmail(email: string): Observable<any> {
    const url = `${this.apiUrl}/api/user/getByEmail`;
    return this.http.get<any>(url, { params: { email } });
  }

  // refresh token
  refreshToken(refreshToken: string): Observable<any> {
    const url = `${this.apiUrl}/auth/refresh`;
    return this.http.post<any>(url, { refreshToken });
  }

}
