import type { RouteObject } from 'react-router-dom'
import { Navigate } from 'react-router-dom'

import { LoginPage } from './features/auth/LoginPage'
import { FichaPage } from './features/ficha/FichaPage'
import { PacientesPage } from './features/pacientes/PacientesPage'
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
        children: [
          { index: true, element: <Navigate to="/pacientes" replace /> },
          { path: 'pacientes', element: <PacientesPage /> },
          { path: 'pacientes/:pacienteId', element: <FichaPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <p className="p-14">Página não encontrada.</p> },
]
