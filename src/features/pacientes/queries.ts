import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import * as recurso from '../../api/recursos/paciente'
import type { NovoPaciente } from '../../api/tipos'

export const chavesDePaciente = {
  lista: ['pacientes'] as const,
  um: (pacienteId: string) => ['paciente', pacienteId] as const,
}

export function usePacientes() {
  return useQuery({ queryKey: chavesDePaciente.lista, queryFn: () => recurso.listarPacientes() })
}

export function usePaciente(pacienteId: string) {
  return useQuery({
    queryKey: chavesDePaciente.um(pacienteId),
    queryFn: () => recurso.buscarPaciente(pacienteId),
  })
}

/**
 * Invalida tambem a auditoria: toda mutacao grava um log no servidor, e a trilha
 * e justamente a tela em que estar desatualizada e pior.
 */
export function useCriarPaciente() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (novo: NovoPaciente) => recurso.criarPaciente(novo),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: chavesDePaciente.lista })
      void client.invalidateQueries({ queryKey: ['auditoria'] })
    },
  })
}
