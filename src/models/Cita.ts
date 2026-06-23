import { IBuilder } from '../Interfaces/arquitectura';

export class Cita {
  public id!: number;
  public pacienteId!: number;
  public fecha!: string;
  public hora!: string;
  public estado!: string;
}

export class CitaBuilder implements IBuilder<Cita> {
  private cita: Cita = new Cita();

  public setId(id: number) { this.cita.id = id; return this; }
  public setPacienteId(id: number) { this.cita.pacienteId = id; return this; }
  public setFecha(fecha: string) { this.cita.fecha = fecha; return this; }
  public setHora(hora: string) { this.cita.hora = hora; return this; }
  public setEstado(estado: string) { this.cita.estado = estado; return this; }

  public build(): Cita { return this.cita; }
}