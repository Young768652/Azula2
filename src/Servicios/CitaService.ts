import { Cita } from '../models/Cita';
import { ICitaRepository } from '../Interfaces/arquitectura';

export class CitaService {
  constructor(private repo: ICitaRepository) {}

  async obtenerTodos(): Promise<Cita[]> {
    return await this.repo.listar();
  }

  async crear(cita: Cita): Promise<void> {
    // Si tu repositorio tiene un método guardar o crear, lo llamamos aquí
    if ('guardar' in this.repo) {
      await (this.repo as any).guardar(cita);
    } else if ('crear' in this.repo) {
      await (this.repo as any).crear(cita);
    }
  }
}
