import { Injectable, OnDestroy } from '@angular/core';
import { Firestore, doc, onSnapshot, Unsubscribe } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Usuario } from '../../usuarios/models/usuario.model';
import { Rol } from '../../roles/models/rol.model';
import { GrupoMenuPermiso } from '../../roles/interfaces/grupo-menu-permiso.interface';
import {
  GRUPOS_MENU_PERMISOS,
  normalizarIdArea,
  normalizarRutaInicio,
  obtenerTodosLosMenusCatalogo,
  resolverPermisosEfectivos,
  RUTA_INICIO_DEFECTO,
} from '../../roles/constants/catalogo-permisos.constants';

interface CachePermisosRol {
  idRol: string;
  idArea: string;
  permisos: string[];
}

@Injectable({
  providedIn: 'root',
})
export class AccessControlService implements OnDestroy {
  private readonly storageUserKey = 'rwuserdatatk';
  private readonly storagePermisosKey = 'rw_role_permisos';
  private readonly storageRutaInicioKey = 'rw_role_ruta_inicio';

  private rolUnsubscribe: Unsubscribe | null = null;
  private currentRolId: string | null = null;
  private currentAreaId: string | null = null;

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
   * Carga los permisos desde cache de localStorage si coinciden con el rol y área
   * del usuario en sesión para renderizar de inmediato sin parpadeo.
   */
  private cargarPermisosIniciales(): Set<string> {
    if (typeof window === 'undefined') return new Set<string>();
    try {
      const usuario = this.obtenerUsuarioSesion();
      const idRolSesion = usuario?.idRol ? String(usuario.idRol).trim() : null;
      const idAreaSesion = normalizarIdArea(usuario?.idArea);
      if (!idRolSesion) return new Set<string>();

      const cached = localStorage.getItem(this.storagePermisosKey);
      if (cached) {
        const parsed = JSON.parse(cached) as Partial<CachePermisosRol> | string[];
        if (
          parsed &&
          !Array.isArray(parsed) &&
          parsed.idRol === idRolSesion &&
          parsed.idArea === idAreaSesion &&
          Array.isArray(parsed.permisos)
        ) {
          this._isLoaded = true;
          return new Set<string>(parsed.permisos);
        }
      }
    } catch {
      // Ignorar errores de parseo
    }
    return new Set<string>();
  }

  private cargarRutaInicioInicial(): string {
    if (typeof window === 'undefined') return RUTA_INICIO_DEFECTO;
    return normalizarRutaInicio(localStorage.getItem(this.storageRutaInicioKey));
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
   * Lee el usuario actual de localStorage y comienza a escuchar su rol en Firebase,
   * evaluando los permisos base junto con las reglas por área del usuario.
   */
  public inicializarEscuchaUsuario(): void {
    const usuario = this.obtenerUsuarioSesion();
    const idRol = usuario?.idRol ? String(usuario.idRol).trim() : null;
    const idArea = normalizarIdArea(usuario?.idArea);

    if (!idRol) {
      this.limpiarPermisos();
      this._isLoaded = true;
      return;
    }

    if (idRol === this.currentRolId && idArea === this.currentAreaId && this.rolUnsubscribe) {
      return;
    }

    const cambioContexto =
      this.currentRolId !== null &&
      (this.currentRolId !== idRol || this.currentAreaId !== idArea);

    this.currentRolId = idRol;
    this.currentAreaId = idArea;
    this.desuscribirRol();

    if (cambioContexto) {
      this._isLoaded = false;
    }

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
            const permisosBase = Array.isArray(data.permisos) ? data.permisos : [];
            const permisosEfectivos = resolverPermisosEfectivos(
              permisosBase,
              data.reglasAreaPorPermiso,
              idArea
            );
            const rutaInicio = normalizarRutaInicio(data.rutaInicio);

            this.actualizarPermisos(permisosEfectivos, rutaInicio, idRol, idArea);
          } else {
            // El rol no existe o no tiene datos aún
            this.actualizarPermisos([], RUTA_INICIO_DEFECTO, idRol, idArea);
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

  private actualizarPermisos(
    permisos: string[],
    rutaInicio: string,
    idRol: string,
    idArea: string
  ): void {
    const set = new Set<string>(permisos);
    this._permisosSubject.next(set);
    this._rutaInicioSubject.next(rutaInicio);

    if (typeof window !== 'undefined') {
      try {
        const cache: CachePermisosRol = { idRol, idArea, permisos };
        localStorage.setItem(this.storagePermisosKey, JSON.stringify(cache));
        localStorage.setItem(this.storageRutaInicioKey, rutaInicio);
      } catch {
        // Ignorar excepciones de almacenamiento
      }
    }
  }

  public limpiarPermisos(): void {
    this.desuscribirRol();
    this.currentRolId = null;
    this.currentAreaId = null;
    this._isLoaded = false;
    this._permisosSubject.next(new Set<string>());
    this._rutaInicioSubject.next(RUTA_INICIO_DEFECTO);

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
