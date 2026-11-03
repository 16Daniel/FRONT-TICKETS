import { Injectable, OnDestroy } from '@angular/core';
import { Firestore, doc, onSnapshot, Unsubscribe } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Usuario } from '../../usuarios/interfaces/usuario.model';
import { Rol } from '../../roles/interfaces/rol.model';
import { GrupoMenuPermiso } from '../../roles/interfaces/ruta.model';
import {
  GRUPOS_MENU_PERMISOS,
  obtenerTodosLosMenusCatalogo,
} from '../../roles/constants/catalogo-permisos.constants';

@Injectable({
  providedIn: 'root',
})
export class AccessControlService implements OnDestroy {
  private readonly storageUserKey = 'rwuserdatatk';
  private readonly storagePermisosKey = 'rw_role_permisos';
  private readonly storageRutaInicioKey = 'rw_role_ruta_inicio';

  private rolUnsubscribe: Unsubscribe | null = null;
  private currentRolId: string | null = null;

  private _isLoaded: boolean = false;
  private _loadPromise: Promise<void> | null = null;
  private _loadResolve: (() => void) | null = null;

  // Permisos activos del rol (Set para búsquedas O(1))
  private _permisosSubject = new BehaviorSubject<Set<string>>(this.cargarPermisosIniciales());
  public permisos$: Observable<Set<string>> = this._permisosSubject.asObservable();

  // Ruta de inicio configurada en el rol
  private _rutaInicioSubject = new BehaviorSubject<string>(this.cargarRutaInicioInicial());
  public rutaInicio$: Observable<string> = this._rutaInicioSubject.asObservable();

  // Grupos y opciones de menú filtrados reactivamente por los permisos del rol
  public gruposMenuVisibles$: Observable<GrupoMenuPermiso[]> = this.permisos$.pipe(
    map((permisosSet) => {
      return GRUPOS_MENU_PERMISOS.map((grupo) => {
        const menusPermitidos = grupo.menus.filter((menu) =>
          permisosSet.has(menu.permisoVista)
        );
        return {
          ...grupo,
          menus: menusPermitidos,
        };
      }).filter((grupo) => grupo.menus.length > 0);
    })
  );

  constructor(private firestore: Firestore) {
    this.inicializarEscuchaUsuario();
  }

  ngOnDestroy(): void {
    this.desuscribirRol();
  }

  /**
   * Carga los permisos desde cache de localStorage para renderizar de inmediato sin parpadeo
   */
  private cargarPermisosIniciales(): Set<string> {
    if (typeof window === 'undefined') return new Set<string>();
    try {
      const cached = localStorage.getItem(this.storagePermisosKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          this._isLoaded = true;
          return new Set<string>(parsed);
        }
      }
    } catch {
      // Ignorar errores de parseo
    }
    return new Set<string>();
  }

  private cargarRutaInicioInicial(): string {
    if (typeof window === 'undefined') return '/main/home';
    return localStorage.getItem(this.storageRutaInicioKey) || '/main/home';
  }

  /**
   * Espera a que los permisos de Firebase estén cargados en memoria
   */
  public async ensureLoaded(): Promise<void> {
    if (this._isLoaded) {
      return;
    }
    if (this._loadPromise) {
      return this._loadPromise;
    }
    return;
  }

  /**
   * Lee el usuario actual de localStorage y comienza a escuchar su rol en Firebase
   */
  public inicializarEscuchaUsuario(): void {
    const usuario = this.obtenerUsuarioSesion();
    const idRol = usuario?.idRol ? String(usuario.idRol).trim() : null;

    if (!idRol) {
      this.limpiarPermisos();
      this._isLoaded = true;
      return;
    }

    if (idRol === this.currentRolId && this.rolUnsubscribe) {
      return;
    }

    this.currentRolId = idRol;
    this.desuscribirRol();

    if (!this._isLoaded) {
      this._loadPromise = new Promise<void>((resolve) => {
        this._loadResolve = resolve;
        // Evita bloqueo infinito en caso de problemas de red
        setTimeout(() => {
          this._isLoaded = true;
          resolve();
        }, 3000);
      });
    }

    // Escucha en tiempo real el documento del rol en Firestore
    try {
      const rolDocRef = doc(this.firestore, `cat_roles/${idRol}`);
      this.rolUnsubscribe = onSnapshot(
        rolDocRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data() as Rol;
            const permisosArr = Array.isArray(data.permisos) ? data.permisos : [];
            const rutaInicio = data.rutaInicio || '/main/home';

            this.actualizarPermisos(permisosArr, rutaInicio);
          } else {
            // El rol no existe o no tiene datos aún
            this.actualizarPermisos([], '/main/home');
          }

          this._isLoaded = true;
          if (this._loadResolve) {
            this._loadResolve();
            this._loadResolve = null;
          }
        },
        (error) => {
          console.error(`[AccessControlService] Error al escuchar rol #${idRol}:`, error);
          this._isLoaded = true;
          if (this._loadResolve) {
            this._loadResolve();
            this._loadResolve = null;
          }
        }
      );
    } catch (err) {
      console.error('[AccessControlService] Error al inicializar listener:', err);
      this._isLoaded = true;
      if (this._loadResolve) {
        this._loadResolve();
        this._loadResolve = null;
      }
    }
  }

  private actualizarPermisos(permisos: string[], rutaInicio: string): void {
    const set = new Set<string>(permisos);
    this._permisosSubject.next(set);
    this._rutaInicioSubject.next(rutaInicio);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.storagePermisosKey, JSON.stringify(permisos));
        localStorage.setItem(this.storageRutaInicioKey, rutaInicio);
      } catch {
        // Ignorar excepciones de almacenamiento
      }
    }
  }

  public limpiarPermisos(): void {
    this.desuscribirRol();
    this.currentRolId = null;
    this._isLoaded = false;
    this._permisosSubject.next(new Set<string>());
    this._rutaInicioSubject.next('/main/home');

    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storagePermisosKey);
      localStorage.removeItem(this.storageRutaInicioKey);
    }
  }

  private desuscribirRol(): void {
    if (this.rolUnsubscribe) {
      this.rolUnsubscribe();
      this.rolUnsubscribe = null;
    }
  }

  public obtenerUsuarioSesion(): Usuario | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(this.storageUserKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /**
   * Consulta sincrónica para saber si el rol del usuario cuenta con un permiso de menú específico
   */
  public can(permiso: string): boolean {
    return this._permisosSubject.getValue().has(permiso);
  }

  /**
   * Retorna true si el rol cuenta con al menos uno de los permisos dados
   */
  public canAny(permisos: string[]): boolean {
    const set = this._permisosSubject.getValue();
    return permisos.some((p) => set.has(p));
  }

  /**
   * Retorna la ruta de inicio configurada en Firebase para el rol actual
   */
  public getRutaInicio(): string {
    return this._rutaInicioSubject.getValue();
  }

  /**
   * Retorna la primera ruta permitida para el rol actual:
   * 1. Revisa si su rutaInicio configurada está permitida.
   * 2. Si no, busca la primera opción de menú que sí tenga habilitada.
   * 3. Si no tiene acceso a ninguna opción, retorna null.
   */
  public getPrimeraRutaPermitida(): string | null {
    const permisos = this._permisosSubject.getValue();
    if (permisos.size === 0) {
      return null;
    }

    const todosMenus = obtenerTodosLosMenusCatalogo();
    const rutaConfigurada = this.getRutaInicio();

    // 1. Verificar si la ruta de inicio configurada en el rol está permitida
    const menuConfigurado = todosMenus.find((m) => m.ruta === rutaConfigurada);
    if (menuConfigurado && permisos.has(menuConfigurado.permisoVista)) {
      return rutaConfigurada;
    }

    // 2. Si no, buscar la primera opción de menú que tenga permitida
    for (const menu of todosMenus) {
      if (!menu.esAccionExterna && permisos.has(menu.permisoVista)) {
        return menu.ruta;
      }
    }

    return null;
  }

  /**
   * Retorna el arreglo completo de permisos activos
   */
  public getPermisos(): string[] {
    return Array.from(this._permisosSubject.getValue());
  }
}
