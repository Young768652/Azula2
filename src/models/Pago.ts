import { IBuilder } from '../Interfaces/arquitectura';

export class Pago {
  public id!: number;
  public pacienteId!: number;
  public concepto!: string;
  public monto!: number;
}

export class PagoBuilder implements IBuilder<Pago> {
  private pago: Pago = new Pago();

  public setId(id: number) { this.pago.id = id; return this; }
  public setPacienteId(id: number) { this.pago.pacienteId = id; return this; }
  public setConcepto(concepto: string) { this.pago.concepto = concepto; return this; }
  public setMonto(monto: number) { this.pago.monto = monto; return this; }

  public build(): Pago { return this.pago; }
}