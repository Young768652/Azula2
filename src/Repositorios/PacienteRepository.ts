import { db } from '../../db';
import { pacientes } from '../../db/schema';
import { Paciente, PacienteBuilder } from '../models/Paciente';
import { IPacienteRepository } from '../Interfaces/arquitectura';

export class PacienteRepository implements IPacienteRepository {
  private database: typeof db;
  constructor(dbInstance: typeof db) { this.database = dbInstance; }

  async listar(): Promise<Paciente[]> {
    const datosBD = await this.database.select().from(pacientes);
    return datosBD.map(dato => 
      new PacienteBuilder()
        .setId(dato.id)
        .setNombre(dato.nombreCompleto || '')
        .setDni(dato.dni)
        .setCelular(dato.celular)
        .setCorreo(dato.correo)
        .build()
    );
  }
}