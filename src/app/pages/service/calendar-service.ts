import { API_CONFIG } from '@/core/config/api.config';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private apiUrl = API_CONFIG.baseUrl;

  constructor(
    private http: HttpClient
  ) { }

  getAll(userId: string, fromDate: string, toDate: string): Observable<any> {
    const url = `${this.apiUrl}/api/getAll-expense-transaction`;
    return this.http.get<any>(url, { params: { userId, fromDate, toDate } });
  }
}
