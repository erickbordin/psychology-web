import { pedir } from '../client'
import type { NovoPaciente, Paciente } from '../tipos'

export function listarPacientes(nome?: string): Promise<Paciente[]> {
  const filtro = nome ? `?nome=${encodeURIComponent(nome)}` : ''
  return pedir<Paciente[]>(`/pacientes${filtro}`)
}

export function buscarPaciente(pacienteId: string): Promise<Paciente> {
  return pedir<Paciente>(`/pacientes/${pacienteId}`)
}

export function criarPaciente(novo: NovoPaciente): Promise<Paciente> {
  return pedir<Paciente>('/pacientes', { method: 'POST', body: JSON.stringify(novo) })
}
