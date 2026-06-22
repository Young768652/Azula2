// Define la forma del Pago/Recibo
export class Pago {
  public id!: number;
  public pacienteId!: number;
  public concepto!: string;
  public monto!: string;
  public estado!: string;
}

// 2. EL ARMADOR (Construye el Pago paso a paso)
export class PagoBuilder {
  private pago: Pago = new Pago();

  public setId(id: number) { this.pago.id = id; return this; }
  public setPacienteId(pId: number) { this.pago.pacienteId = pId; return this; }
  public setConcepto(con: string) { this.pago.concepto = con; return this; }
  public setMonto(mon: string) { this.pago.monto = mon; return this; }
  public setEstado(est: string) { this.pago.estado = est; return this; }

  public build(): Pago { return this.pago; }
}
