import { db } from '../../db/index'; 
import { pacientes } from '../../db/schema';
import { Paciente, PacienteBuilder } from '../models/Paciente'; 

export class PacienteController {
  private database: typeof db;

  // CONSTRUCTOR: Recibe la conexión a la base de datos
  constructor(dbInstance: typeof db) {
    this.database = dbInstance;
  }

  async listar(): Promise<Paciente[]> {
    const datosBD = await this.database.select().from(pacientes);
    // Usamos el Armador para ordenar la información en Moldes
    return datosBD.map(dato => 
      new PacienteBuilder()
        .setId(dato.id)
        .setNombre(dato.nombreCompleto)
        .setDni(dato.dni)
        .setCelular(dato.celular)
        .setCorreo(dato.correo)
        .build()
    );
  }
}
export const pacienteController = new PacienteController(db);