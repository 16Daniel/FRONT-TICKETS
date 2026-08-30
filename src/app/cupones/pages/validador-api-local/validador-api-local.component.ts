import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-validador-api-local',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './validador-api-local.component.html',
  styleUrl: './validador-api-local.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ValidadorApiLocalComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  isTesting: boolean = false;
  lastTestedAt: string | null = null;

  tipo: 'consumos' | 'cupones' = 'consumos';
  titulo: string = 'Validador de Consumos';
  iconClass: string = 'bx-receipt';
  validadorUrl: string = 'http://localhost:3003/validador';

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const tipoParam = params['tipo'] || this.route.snapshot.data['tipo'];
      if (tipoParam === 'cupones') {
        this.tipo = 'cupones';
        this.titulo = 'Validador de Cupones';
        this.iconClass = 'bx-check-shield';
        this.validadorUrl = 'http://localhost:3001';
      } else {
        this.tipo = 'consumos';
        this.titulo = 'Validador de Consumos';
        this.iconClass = 'bx-receipt';
        this.validadorUrl = 'http://localhost:3003/validador';
      }
      this.cdr.markForCheck();
    });
  }

  reintentarConexion(): void {
    if (this.isTesting) return;

    this.isTesting = true;
    this.cdr.markForCheck();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    fetch(this.validadorUrl, { method: 'GET', signal: controller.signal })
      .then(() => {
        clearTimeout(timeoutId);
        this.isTesting = false;
        this.lastTestedAt = new Date().toLocaleTimeString();
        this.cdr.markForCheck();

        Swal.fire({
          icon: 'success',
          title: '¡Conexión establecida!',
          text: `Se detectó respuesta del ${this.titulo}. Redirigiendo...`,
          timer: 1800,
          showConfirmButton: false,
        }).then(() => {
          window.open(this.validadorUrl, '_blank', 'noopener,noreferrer');
        });
      })
      .catch(() => {
        fetch(this.validadorUrl, { method: 'GET', mode: 'no-cors', signal: controller.signal })
          .then(() => {
            clearTimeout(timeoutId);
            this.isTesting = false;
            this.lastTestedAt = new Date().toLocaleTimeString();
            this.cdr.markForCheck();

            Swal.fire({
              icon: 'success',
              title: '¡Conexión establecida!',
              text: `Se detectó respuesta del ${this.titulo}. Redirigiendo...`,
              timer: 1800,
              showConfirmButton: false,
            }).then(() => {
              window.open(this.validadorUrl, '_blank', 'noopener,noreferrer');
            });
          })
          .catch(() => {
            clearTimeout(timeoutId);
            this.isTesting = false;
            this.lastTestedAt = new Date().toLocaleTimeString();
            this.cdr.markForCheck();

            Swal.fire({
              icon: 'warning',
              title: 'Sin respuesta del servidor',
              text: `No se pudo contactar la API local en ${this.validadorUrl}. Asegúrate de estar en la red de sucursal con el servicio activo.`,
              confirmButtonColor: '#0F62FE',
              confirmButtonText: 'Entendido',
            });
          });
      });
  }

  irAlInicio(): void {
    this.router.navigate(['/main/home']);
  }
}
