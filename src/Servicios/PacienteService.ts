import { Paciente } from '../models/Paciente';
import { IPacienteRepository } from '../Interfaces/arquitectura';

export class PacienteService {
  constructor(private repository: IPacienteRepository) {}
  async obtenerTodos(): Promise<Paciente[]> {
    return await this.repository.listar();
  }
}
