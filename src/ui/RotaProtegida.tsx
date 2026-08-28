import { Navigate, Outlet } from 'react-router-dom'

import { useSessao } from '../features/auth/useSessao'

export function RotaProtegida() {
  const { autenticado, carregando } = useSessao()

  if (carregando) {
    return <p className="p-14 text-sm text-tinta-3">Carregando…</p>
  }

  return autenticado ? <Outlet /> : <Navigate to="/login" replace />
}
