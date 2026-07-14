import { Usuario } from '../models/Usuario';
import { IUsuarioRepository } from '../Interfaces/arquitectura';

export class UsuarioService {
  constructor(private repository: IUsuarioRepository) {}
  async obtenerTodos(): Promise<Usuario[]> {
    return await this.repository.listar();
  }
}
