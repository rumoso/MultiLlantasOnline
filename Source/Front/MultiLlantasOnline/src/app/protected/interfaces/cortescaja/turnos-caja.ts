import { Cajas, initCajas } from "../cajas/cajas";
import { User, initUser } from "../user";

// Interfaz principal para los turnos de caja
export interface TurnosCaja {
  idturnoscaja?: number;            // PK autoincremental (opcional para nuevos registros)
  idcajas: number;                  // ID de la caja (FK)
  idUser: number;                   // ID del usuario/cajero (FK)
  fechainicio?: Date | string;      // Fecha y hora de inicio del turno
  fechafin?: Date | string;
  user:User;
  caja:Cajas;     // Fecha y hora de fin del turno
}

export function initTurnosCaja():TurnosCaja{
  return {
    idturnoscaja:0,
    idcajas: 0,
    idUser: 0,
    fechainicio: '',
    fechafin: '',
    user: initUser(),
    caja: initCajas()
  };
}

// Interfaz para consultas y filtros de turnos
export interface FiltroTurnosCaja {
  idcajas?: number;
  idUser?: number;
  fechainicio?: Date | string;
  fechafin?: Date | string;
  fechaInicioRango?: Date | string;
  fechaFinRango?: Date | string;
  turnoActivo?: boolean;
}
