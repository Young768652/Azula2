// Define la forma del Usuario
export class Usuario {
  public id!: number;
  public nombre!: string;
  public email!: string;
  public rol!: string;
}

// 2. EL ARMADOR (Construye al Usuario paso a paso)
export class UsuarioBuilder {
  private usuario: Usuario = new Usuario();

  public setId(id: number) { this.usuario.id = id; return this; }
  public setNombre(nom: string) { this.usuario.nombre = nom; return this; }
  public setEmail(email: string) { this.usuario.email = email; return this; }
  public setRol(rol: string) { this.usuario.rol = rol; return this; }

  public build(): Usuario { return this.usuario; }
}