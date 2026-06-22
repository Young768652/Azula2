//Define la forma de la Cita
export class Cita {
  public id!: number;
  public pacienteId!: number;
  public fecha!: string;
  public hora!: string;
  public especialidad!: string;
  public estado!: string;
}

// 2. EL ARMADOR (Construye la Cita paso a paso)
export class CitaBuilder {
  private cita: Cita = new Cita();

  public setId(id: number) { this.cita.id = id; return this; }
  public setPacienteId(pId: number) { this.cita.pacienteId = pId; return this; }
  public setFecha(fecha: string) { this.cita.fecha = fecha; return this; }
  public setHora(hora: string) { this.cita.hora = hora; return this; }
  public setEspecialidad(esp: string) { this.cita.especialidad = esp; return this; }
  public setEstado(est: string) { this.cita.estado = est; return this; }

  public build(): Cita { return this.cita; }
}