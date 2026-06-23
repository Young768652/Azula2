// Contrato genérico para el Patrón Builder
export interface IBuilder<T> {
  build(): T;
}

// Contratos específicos para los Repositorios (Interface Segregation)
import { Paciente } from '../models/Paciente';
import { Cita } from '../models/Cita';
import { Usuario } from '../models/Usuario';
import { Pago } from '../models/Pago';

export interface IPacienteRepository {
  listar(): Promise<Paciente[]>;
}

export interface ICitaRepository {
  listar(): Promise<Cita[]>;
}

export interface IUsuarioRepository {
  listar(): Promise<Usuario[]>;
}

export interface IPagoRepository {
  listar(): Promise<Pago[]>;
}