import type { RouteObject } from 'react-router-dom'

import { LoginPage } from './features/auth/LoginPage'
import { Layout } from './ui/Layout'
import { RotaProtegida } from './ui/RotaProtegida'

export const definicaoDeRotas: RouteObject[] = [
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <RotaProtegida />,
    children: [
      {
        element: <Layout />,
        // Tasks 7 e 8 acrescentam as rotas de paciente e ficha aqui dentro.
        // O index vazio existe so para o "/" ter um match terminal e o
        // Layout (nav + Sair) renderizar antes de existir uma pagina real.
        children: [{ index: true, element: null }],
      },
    ],
  },
  { path: '*', element: <p className="p-14">Página não encontrada.</p> },
]
