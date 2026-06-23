import { db } from '../../db';
import { CitaRepository } from '../Repositorios/CitaRepository';
import { CitaService } from '../servicios/CitaService';
import { CitaBuilder } from '../models/Cita';

export class CitaController {
  constructor(private service: CitaService) {}

  async listar() { 
    return await this.service.obtenerTodos(); 
  }

  async crear(req: any) {
    const nuevaCita = new CitaBuilder()
      .setPacienteId(Number(req.body.pacienteId))
      .setFecha(req.body.fecha)
      .setHora(req.body.hora)
      .setEstado(req.body.estado || 'Pendiente')
      .build();

    return await this.service.crear(nuevaCita);
  }
}

const repo = new CitaRepository(db);
const servicio = new CitaService(repo);
export const citaController = new CitaController(servicio);