import { Injectable } from '@angular/core';
import { API_CONFIG } from '../config/api.config';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Country } from '../model/country.model';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  baseUrl = API_CONFIG.baseUrl;
  constructor(
    private http: HttpClient
  ) { }

  // Lấy danh sách quốc gia
  getCountries(): Observable<Country[]> {
    const apiUrl = `https://restcountries.com/v3.1/all?fields=name,cca2`;
    return this.http.get<Country[]>(apiUrl);
  }


}
