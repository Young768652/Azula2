import { db } from '../../db';
import { PacienteRepository } from '../Repositorios/PacienteRepository';
import { PacienteService } from '../Servicios/PacienteService';

export class PacienteController {
  constructor(private service: PacienteService) {}

  async listar() { 
    return await this.service.obtenerTodos(); 
  }
}

const repo = new PacienteRepository(db);
const servicio = new PacienteService(repo);
export const pacienteController = new PacienteController(servicio);