import { db } from '../../db';
import { pagos } from '../../db/schema';
import { Pago, PagoBuilder } from '../models/Pago';
import { IPagoRepository } from '../Interfaces/arquitectura';

export class PagoRepository implements IPagoRepository {
  private database: typeof db;
  constructor(dbInstance: typeof db) { this.database = dbInstance; }

  async listar(): Promise<Pago[]> {
    const datosBD = await this.database.select().from(pagos);
    return datosBD.map(dato => 
      new PagoBuilder()
        .setId(dato.id)
        .setPacienteId(dato.pacienteId)
        .setConcepto(dato.concepto)
        .setMonto(Number(dato.monto))
        .build()
    );
  }
}