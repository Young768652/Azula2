import { db } from '../../db';
import { PagoRepository } from '../Repositorios/PagoRepository';
import { PagoService } from '../servicios/PagoService';
import { PagoBuilder } from '../models/Pago';

export class PagoController {
  constructor(private service: PagoService) {}

  async listar() { 
    return await this.service.obtenerTodos(); 
  }

  async crear(req: any) {
    const nuevoPago = new PagoBuilder()
      .setPacienteId(Number(req.body.pacienteId))
      .setConcepto(req.body.concepto)
      .setMonto(Number(req.body.monto))
      .build();

    return await this.service.crear(nuevoPago);
  }
}

const repo = new PagoRepository(db);
const servicio = new PagoService(repo);
export const pagoController = new PagoController(servicio);