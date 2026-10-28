import { ResponsableNivel } from './responsable-nivel.interface';

export interface EscalationLevel {
  id: string;
  level: number;
  responsables: ResponsableNivel[];
  role?: string;
}
