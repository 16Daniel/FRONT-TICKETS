export class MentionUtils {
  /**
   * Extrae los IDs de los usuarios etiquetados (mentions) a partir del HTML generado por quill-mention.
   * @param html Contenido HTML del editor (p-editor)
   * @returns Un arreglo con los IDs únicos de los usuarios etiquetados
   */
  static extraerUsuariosEtiquetados(html: string): string[] {
    if (!html) return [];
    const div = document.createElement('div');
    div.innerHTML = html;
    const mentions = div.querySelectorAll('.mention');
    const ids: string[] = [];
    mentions.forEach(m => {
      const id = m.getAttribute('data-id');
      if (id && !ids.includes(id)) {
        ids.push(id);
      }
    });
    return ids;
  }
}
