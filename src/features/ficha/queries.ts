import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import * as recurso from '../../api/recursos/anotacao'

export const chavesDeAnotacao = {
  lista: (pacienteId: string, pagina: number) => ['anotacoes', pacienteId, pagina] as const,
  todas: (pacienteId: string) => ['anotacoes', pacienteId] as const,
}

export function useAnotacoes(pacienteId: string, pagina: number) {
  return useQuery({
    queryKey: chavesDeAnotacao.lista(pacienteId, pagina),
    queryFn: () => recurso.listarAnotacoes(pacienteId, pagina),
  })
}

export function useCriarAnotacao(pacienteId: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (anotacao: string) => recurso.criarAnotacao(pacienteId, anotacao),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: chavesDeAnotacao.todas(pacienteId) })
      void client.invalidateQueries({ queryKey: ['auditoria'] })
    },
  })
}
