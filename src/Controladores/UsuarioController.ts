import { db } from '../../db/index'; 
import { usuarios } from '../../db/schema';
import { Usuario, UsuarioBuilder } from '../models/Usuario'; 

export class UsuarioController {
  private database: typeof db;

  constructor(dbInstance: typeof db) {
    this.database = dbInstance;
  }

  async listar(): Promise<Usuario[]> {
    const datosBD = await this.database.select().from(usuarios);
    return datosBD.map(dato => 
      new UsuarioBuilder()
        .setId(dato.id)
        .setNombre(dato.nombre)
        .setEmail(dato.email)
        .setRol(dato.rol)
        .build()
    );
  }
}
export const usuarioController = new UsuarioController(db);