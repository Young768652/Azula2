import { Pago } from '../models/Pago';
import { IPagoRepository } from '../Interfaces/arquitectura';

export class PagoService {
  constructor(private repo: IPagoRepository) {}

  async obtenerTodos(): Promise<Pago[]> {
    return await this.repo.listar();
  }

  async crear(pago: Pago): Promise<void> {
    if ('guardar' in this.repo) {
      await (this.repo as any).guardar(pago);
    } else if ('crear' in this.repo) {
      await (this.repo as any).crear(pago);
    }
  }
}
