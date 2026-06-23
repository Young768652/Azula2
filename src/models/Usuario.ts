import { IBuilder } from '../Interfaces/arquitectura';

export class Usuario {
  public id!: number;
  public nombre!: string;
  public email!: string;
  public rol!: string;
}

export class UsuarioBuilder implements IBuilder<Usuario> {
  private usuario: Usuario = new Usuario();

  public setId(id: number) { this.usuario.id = id; return this; }
  public setNombre(nombre: string) { this.usuario.nombre = nombre; return this; }
  public setEmail(email: string) { this.usuario.email = email; return this; }
  public setRol(rol: string) { this.usuario.rol = rol; return this; }

  public build(): Usuario { return this.usuario; }
}