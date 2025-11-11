import { Injectable } from '@angular/core';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';

@Injectable({
  providedIn: 'root',
})
export class FirebaseStorageService {
  private CARPETA_EVIDENCIAS_TICKET = 'imagenes/tickets/evidencias';
  private CARPETA_EVIDENCIAS_MANTENIMIENTOS = 'imagenes/mantenimientos/evidencias';
  private CARPETA_EVIDENCIAS_COMPRAS = 'imagenes/compras/evidencias';

  constructor() { }

  async cargarImagenesEvidenciasTicket(archivos: File[]): Promise<string[]> {
    const storage = getStorage();

    // Obtener año y mes actual en formato "YYYY-MM"
    const now = new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const promesas = archivos.map((archivo) => {
      return new Promise<string>((resolve, reject) => {
        const timestamp = Date.now();
        const nombreUnico = `${timestamp}_${archivo.name}`;

        // Ruta final incluyendo año y mes
        const rutaFinal = `${this.CARPETA_EVIDENCIAS_TICKET}/${yearMonth}/${nombreUnico}`;
        const fileRef = ref(storage, rutaFinal);
        const uploadTask = uploadBytesResumable(fileRef, archivo);

        uploadTask.on(
          'state_changed',
          null,
          (error) => {
            console.error(`Error al subir ${archivo.name}`, error);
            reject(error);
          },
          async () => {
            try {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              console.log(`Imagen ${archivo.name} cargada correctamente como ${nombreUnico}`);
              resolve(url);
            } catch (err) {
              reject(err);
            }
          }
        );
      });
    });

    return Promise.all(promesas);
  }

  async cargarImagenesEvidenciasMantenimiento(archivo: File, area: string): Promise<string> {
    const storage = getStorage();

    const now = new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    return new Promise<string>((resolve, reject) => {
      const timestamp = Date.now();
      const nombreUnico = `${timestamp}_${archivo.name}`;

      const rutaFinal = `${this.CARPETA_EVIDENCIAS_MANTENIMIENTOS}/${area}/${yearMonth}/${nombreUnico}`;
      const fileRef = ref(storage, rutaFinal);
      const uploadTask = uploadBytesResumable(fileRef, archivo);

      uploadTask.on(
        'state_changed',
        null,
        (error) => {
          console.error(`Error al subir ${archivo.name}`, error);
          reject(error);
        },
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            console.log(`Imagen ${archivo.name} cargada correctamente como ${nombreUnico}`);
            resolve(url);
          } catch (err) {
            reject(err);
          }
        }
      );
    });
  }

  async cargarImagenesEvidenciasCompras(archivo: File): Promise<string> {
    // debugger
    const storage = getStorage();

    const now = new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    return new Promise<string>((resolve, reject) => {
      const timestamp = Date.now();
      const nombreUnico = `${timestamp}_${archivo.name}`;

      const rutaFinal = `${this.CARPETA_EVIDENCIAS_COMPRAS}/${yearMonth}/${nombreUnico}`;
      const fileRef = ref(storage, rutaFinal);
      const uploadTask = uploadBytesResumable(fileRef, archivo);

      uploadTask.on(
        'state_changed',
        null,
        (error) => {
          console.error(`Error al subir ${archivo.name}`, error);
          reject(error);
        },
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            console.log(`Imagen ${archivo.name} cargada correctamente como ${nombreUnico}`);
            resolve(url);
          } catch (err) {
            reject(err);
          }
        }
      );
    });
  }
}
