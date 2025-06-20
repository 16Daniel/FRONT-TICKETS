import { Injectable } from '@angular/core';
type ColorHex = `#${string}`;
@Injectable({
  providedIn: 'root'
})
export class ColorRandomService {

  constructor() { }
generarColor(): ColorHex {
    const red = Math.floor(Math.random() * 256);
    const green = Math.floor(Math.random() * 256);
    const blue = Math.floor(Math.random() * 256);

    const background = this.rgbToHex(red, green, blue);

    return background;
  }

  /**
   * Convierte valores RGB a formato hexadecimal
   */
  private rgbToHex(r: number, g: number, b: number): ColorHex {
    const toHex = (c: number) => c.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase() as ColorHex;
  }

  /**
   * Determina el mejor color de texto (blanco o negro) basado en el brillo del fondo
   */
  private getContrastingTextColor(r: number, g: number, b: number): ColorHex {
    // Fórmula de luminosidad relativa WCAG
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  }

}
