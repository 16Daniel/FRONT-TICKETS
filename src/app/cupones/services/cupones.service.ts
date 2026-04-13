import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { BatchResponse } from '../interfaces/batch-response.interface';
import { BatchDto } from '../interfaces/batch.interface';

@Injectable({
  providedIn: 'root'
})
export class CuponesService {

  private http = inject(HttpClient);
  private apiUrl = environment.apiCuponesUrl;

  /**
   * Genera cupones por lote
   */
  generateBatch(body: BatchDto): Observable<BatchResponse> {
    return this.http.post<BatchResponse>(
      `${this.apiUrl}/batch`,
      body
    );
  }
}