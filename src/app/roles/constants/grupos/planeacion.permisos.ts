import { GrupoMenuPermiso } from '../../interfaces/ruta.model';

export const GRUPO_PERMISOS_PLANEACION: GrupoMenuPermiso = {
  idGrupo: 'planeacion',
  tituloGrupo: 'Planeación',
  iconoGrupo: 'bx bx-book-open',
  descripcionGrupo: 'Diccionarios operativos, control de mermas y precios AYC / Delivery',
  menus: [
    {
      idMenu: 'planeacion_diccionario',
      titulo: 'Diccionario',
      ruta: '/planeacion/diccionario',
      icono: 'bx bx-book-open',
      permisoVista: 'planeacion.diccionario.ver',
    },
    {
      idMenu: 'planeacion_mermas',
      titulo: 'Mermas',
      ruta: '/planeacion/mermas',
      icono: 'bx bx-trash',
      permisoVista: 'planeacion.mermas.ver',
    },
    {
      idMenu: 'planeacion_precios_ayc',
      titulo: 'Precios AYC',
      ruta: '/main/precios-ayc',
      icono: 'bx bx-dollar-circle',
      permisoVista: 'planeacion.precios_ayc.ver',
    },
    {
      idMenu: 'planeacion_delivery',
      titulo: 'Diccionario delivery',
      ruta: '/main/diccionario-delivery',
      icono: 'bx bx-book-bookmark',
      permisoVista: 'delivery.diccionario.ver',
    },
  ],
};
