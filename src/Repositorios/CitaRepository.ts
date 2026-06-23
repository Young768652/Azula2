import { db } from '../../db';
import { citas } from '../../db/schema';
import { Cita, CitaBuilder } from '../models/Cita';
import { ICitaRepository } from '../Interfaces/arquitectura';

export class CitaRepository implements ICitaRepository {
  private database: typeof db;
  constructor(dbInstance: typeof db) { this.database = dbInstance; }

  async listar(): Promise<Cita[]> {
    const datosBD = await this.database.select().from(citas);
    return datosBD.map(dato => 
      new CitaBuilder()
        .setId(dato.id)
        .setPacienteId(dato.pacienteId)
        .setFecha(dato.fecha)
        .setHora(dato.hora)
        .setEstado(dato.estado || 'Pendiente')
        .build()
    );
  }
}