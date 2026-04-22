import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { BatchResponse } from '../interfaces/batch-response.interface';
import { BatchDto } from '../interfaces/batch.interface';
import { LoteInfo } from '../interfaces/lote-info.interface';
import { HttpHeaders } from '@angular/common/http';
import { AidaConfig } from '../interfaces/aida-config.interface';

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
      `${this.apiUrl}/cupones/batch`,
      body,
      {
        headers: {
          'x-api-key': environment.apiKeyCupones
        }
      }
    );
  }

  /**
   * Obtiene el historial y contador de cada lote
   */
  getLotesInfo(): Observable<LoteInfo[]> {
    return this.http.get<LoteInfo[]>(`${this.apiUrl}/lotes`, {
      headers: {
        'x-api-key': environment.apiKeyCupones
      }
    });
  }

  updateLoteReferencia(loteId: string, referencia: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/lotes/${loteId}/referencia`, { referencia }, {
      headers: {
        'x-api-key': environment.apiKeyCupones
      }
    });
  }

  getAidaConfig() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-API-Key': environment.apiKeyCupones
    });

    return this.http.get<AidaConfig>(`${this.apiUrl}/aida`, { headers });
  }
}