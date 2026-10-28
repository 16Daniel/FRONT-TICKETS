export class FileUtils {
  static obtenerIconoArchivo(nombre: string, tipo: string): string {
    const ext = nombre.split('.').pop()?.toLowerCase();
    if (ext === 'pdf' || tipo === 'application/pdf') return 'bx bxs-file-pdf';
    if (ext === 'doc' || ext === 'docx' || tipo.includes('word')) return 'bx bxs-file-doc';
    if (ext === 'xls' || ext === 'xlsx' || tipo.includes('excel') || tipo.includes('spreadsheet')) return 'bx bxs-spreadsheet';
    if (ext === 'ppt' || ext === 'pptx' || tipo.includes('presentation')) return 'bx bxs-slideshow';
    if (ext === 'zip' || ext === 'rar' || tipo.includes('zip')) return 'bx bxs-file-archive';
    if (ext === 'txt' || tipo.includes('text')) return 'bx bxs-file-txt';
    return 'bx bxs-file-blank';
  }

  static obtenerColorArchivo(nombre: string, tipo: string): string {
    const ext = nombre.split('.').pop()?.toLowerCase();
    if (ext === 'pdf' || tipo === 'application/pdf') return '#ef4444';
    if (ext === 'doc' || ext === 'docx' || tipo.includes('word')) return '#3b82f6';
    if (ext === 'xls' || ext === 'xlsx' || tipo.includes('excel') || tipo.includes('spreadsheet')) return '#10b981';
    if (ext === 'ppt' || ext === 'pptx' || tipo.includes('presentation')) return '#f97316';
    if (ext === 'zip' || ext === 'rar' || tipo.includes('zip')) return '#8b5cf6';
    if (ext === 'txt' || tipo.includes('text')) return '#64748b';
    return '#64748b';
  }
}
