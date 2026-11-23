import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import {
  addDoc,
  collection,
  doc,
  Firestore,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Responsable } from '../models/responsable.model';
import { EnviarCorreoRequest, MailService } from '../../shared/services/mail.service';

@Injectable({
  providedIn: 'root',
})
export class ResponsablesService {

  private pathName = 'responsables';

  private _responsables: Responsable[] = [];
  private _responsablesSubject = new BehaviorSubject<Responsable[]>([]);
  public responsables$: Observable<Responsable[]> =
    this._responsablesSubject.asObservable();

  private _unsubscribe: (() => void) | null = null;
  private _loaded = false;

  public get responsables(): Responsable[] {
    return this._responsables;
  }

  constructor(
    private firestore: Firestore,
    private mailService: MailService
  ) {
    this.initListener();
  }

  public initListener(): void {
    if (this._loaded) return;

    const collectionRef = collection(this.firestore, this.pathName);
    const q = query(collectionRef, where('eliminado', '==', false));

    this._unsubscribe = onSnapshot(q, (querySnapshot) => {
      this._responsables = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Responsable, 'id'>),
      }));

      this._responsablesSubject.next(this._responsables);
      this._loaded = true;
    });
  }

  async create(responsable: Responsable): Promise<string> {
    const ref = collection(this.firestore, this.pathName);
    const docRef = await addDoc(ref, responsable);
    return docRef.id;
  }

  async update(
    responsable: Partial<Responsable>,
    idResponsable: string
  ): Promise<void> {
    const documentRef = doc(
      this.firestore,
      `${this.pathName}/${idResponsable}`
    );
    return updateDoc(documentRef, responsable);
  }

  async delete(idResponsable: string): Promise<void> {
    try {
      const docRef = doc(
        this.firestore,
        `${this.pathName}/${idResponsable}`
      );
      await updateDoc(docRef, { eliminado: true });
      this._responsables = this._responsables.filter(r => r.id !== idResponsable);
      this._responsablesSubject.next(this._responsables);
    } catch (error) {
      console.error('Error al eliminar responsable:', error);
      throw error;
    }
  }

  unsubscribe(): void {
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
      this._loaded = false;
    }
  }

  public filtrarPorSucursal(
    idSucursal: string | null,
    globales: boolean = true
  ): Responsable[] {
    if (!idSucursal) return [];

    return this._responsables.filter(
      r =>
        r.idSucursal === idSucursal ||
        (globales && r.esGlobal)
    );
  }

  public filtrarGlobales(): Responsable[] {
    return this._responsables.filter(
      r => r.esGlobal === true
    );
  }

  public buscarPorPin(pin: string): Responsable | null {
    if (!pin) return null;

    return (
      this._responsables.find(
        r => r.pin === pin && r.eliminado === false
      ) || null
    );
  }

  async generarPinUnico(): Promise<string> {
    for (let i = 0; i < 10; i++) {
      const pin = Math.floor(1000 + Math.random() * 9000).toString();

      const q = query(
        collection(this.firestore, this.pathName),
        where('pin', '==', pin)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return pin; // ✅ PIN único encontrado
      }
    }

    throw new Error('No se pudo generar un PIN único después de varios intentos');
  }

  async correoExiste(correo: string): Promise<boolean> {
    if (!correo) return false;

    const q = query(
      collection(this.firestore, this.pathName),
      where('correo', '==', correo.toLowerCase()),
      where('eliminado', '==', false)
    );

    const snapshot = await getDocs(q);

    return !snapshot.empty;
  }

  enviarCorreoPin(
    responsable: Responsable,
    nombreSucursal: string,
    pin: string
  ): Observable<any> {
    const request: EnviarCorreoRequest = {
      titulo: 'Tu PIN ha sido generado',
      body: this.generarHtmlCorreoPin(responsable.nombre, nombreSucursal, pin),
      destinatario: responsable.correo,
    };

    return this.mailService.enviarCorreo(request);
  }

  generarHtmlCorreoPin(nombre: string, sucursal: string, pin: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        .pin-text { font-family: 'Courier New', Courier, monospace !important; }
      </style>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f6fa; color: #1e1e24;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.03);">

        <tr>
          <td align="center" style="padding: 30px 20px; background-color: #D3152A;">
            <h2 style="margin: 0; color: #ffffff; font-size: 22px; text-transform: uppercase; letter-spacing: 2px;">
              Seguridad de Acceso
            </h2>
          </td>
        </tr>

        <tr>
          <td style="padding: 40px 30px;">
            <p style="font-size: 16px; line-height: 1.5; margin-top: 0;">
              Hola <strong>${nombre}</strong>,
            </p>
            <p style="font-size: 15px; color: #64748b; line-height: 1.5;">
              Este es tu código de acceso para el sistema de tickets en la sucursal: <br>
              <span style="color: #1e1e24; font-weight: bold;">${sucursal}</span>
            </p>

            <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 35px auto;">
              <tr>
                <td align="center" style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 20px 35px;">
                  <span class="pin-text" style="font-size: 36px; font-weight: bold; color: #D3152A; letter-spacing: 12px;">
                    ${pin}
                  </span>
                </td>
              </tr>
            </table>

            <p style="font-size: 13px; color: #94a3b8; text-align: center; line-height: 1.4; margin-bottom: 0;">
              Por razones de seguridad, no compartas este código con nadie. <br>
              Si tú no realizaste este cambio, informa a tu supervisor de inmediato.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding: 0 30px 30px 30px;">
            <div style="border-top: 1px solid #eeeeee;"></div>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
  }

}
