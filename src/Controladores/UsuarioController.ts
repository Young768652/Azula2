import { db } from '../../db/index';
import { UsuarioRepository } from '../Repositorios/UsuarioRepository';
import { UsuarioService } from '../servicios/UsuarioService';

export class UsuarioController {
  constructor(private service: UsuarioService) {}
  async listar() { return await this.service.obtenerTodos(); }
}

const repo = new UsuarioRepository(db);
const servicio = new UsuarioService(repo);
export const usuarioController = new UsuarioController(servicio);