// Define la forma del Paciente
export class Paciente {
  public id!: number;
  public nombreCompleto!: string;
  public dni!: string;
  public celular: string | null = null;
  public correo: string | null = null;
}

// 2. EL ARMADOR (Construye al Paciente paso a paso)
export class PacienteBuilder {
  private paciente: Paciente = new Paciente();

  public setId(id: number) { this.paciente.id = id; return this; }
  public setNombre(nombre: string) { this.paciente.nombreCompleto = nombre; return this; }
  public setDni(dni: string) { this.paciente.dni = dni; return this; }
  public setCelular(cel: string | null) { this.paciente.celular = cel; return this; }
  public setCorreo(correo: string | null) { this.paciente.correo = correo; return this; }

  public build(): Paciente { return this.paciente; }
}