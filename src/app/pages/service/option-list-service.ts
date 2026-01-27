import { API_CONFIG } from '@/core/config/api.config';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OptionListService {
  private apiUrl = API_CONFIG.baseUrl;

  constructor(
    private http: HttpClient
  ) { }

  // getOptionList
  getOptionList(userId: string, type: string): Observable<any> {
    const url = `${this.apiUrl}/api/option/user`;
    return this.http.get<any>(url, { params: { userId, type } });
  }

  saveExpenseTransaction(data: any): Observable<string> {
    const url = `${this.apiUrl}/api/option/save-expense-transaction`;
    return this.http.post(url, data, {
      responseType: 'text'
    });
  }

}
