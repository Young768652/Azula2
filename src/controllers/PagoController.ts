import { db } from '../../db/index'; 
import { pagos } from '../../db/schema';
import { Pago, PagoBuilder } from '../models/Pago'; 

export class PagoController {
  private database: typeof db;

  constructor(dbInstance: typeof db) {
    this.database = dbInstance;
  }

  async listar(): Promise<Pago[]> {
    const datosBD = await this.database.select().from(pagos);
    return datosBD.map(dato => 
      new PagoBuilder()
        .setId(dato.id)
        .setPacienteId(dato.pacienteId)
        .setConcepto(dato.concepto)
        .setMonto(dato.monto)
        .setEstado(dato.estado)
        .build()
    );
  }
}
export const pagoController = new PagoController(db);