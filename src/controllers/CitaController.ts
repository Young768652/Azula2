import { db } from '../../db/index'; 
import { citas } from '../../db/schema';
import { Cita, CitaBuilder } from '../models/Cita'; 

export class CitaController {
  private database: typeof db;

  constructor(dbInstance: typeof db) {
    this.database = dbInstance;
  }

  async listar(): Promise<Cita[]> {
    const datosBD = await this.database.select().from(citas);
    return datosBD.map(dato => 
      new CitaBuilder()
        .setId(dato.id)
        .setPacienteId(dato.pacienteId)
        .setFecha(dato.fecha)
        .setHora(dato.hora)
        .setEspecialidad(dato.especialidad)
        .setEstado(dato.estado)
        .build()
    );
  }
}
export const citaController = new CitaController(db);