import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'linkify',
  standalone: true
})
export class LinkifyPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) { }

  transform(text: string): SafeHtml {
    if (!text) return '';

    const urlRegex = /((https?:\/\/)|(www\.))[^\s]+/g;

    const html = text
      // saltos de línea
      .replace(/\n/g, '<br>')
      // urls automáticas
      .replace(urlRegex, (url) => {
        const link = url.startsWith('http') ? url : `https://${url}`;
        return `<a href="${link}" target="_blank" rel="noopener noreferrer">${url}</a>`;
      });

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
