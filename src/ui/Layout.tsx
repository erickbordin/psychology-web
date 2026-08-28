import { NavLink, Outlet } from 'react-router-dom'

import { useSessao } from '../features/auth/useSessao'
import { Botao } from './Botao'

const ITENS = [{ para: '/pacientes', rotulo: 'Pacientes' }]

export function Layout() {
  const { sair } = useSessao()

  return (
    <div className="flex min-h-screen">
      <nav
        aria-label="Navegação principal"
        className="flex w-60 shrink-0 flex-col gap-8 border-r border-linha bg-superficie p-6"
      >
        <p className="font-serif text-lg">
          psychology<span className="font-mono text-xs text-tinta-3">/api</span>
        </p>

        <ul className="flex flex-col gap-1">
          {ITENS.map((item) => (
            <li key={item.para}>
              <NavLink
                to={item.para}
                className={({ isActive }) =>
                  `block rounded px-3 py-2 text-sm ${isActive ? 'bg-fundo text-tinta' : 'text-tinta-2'}`
                }
              >
                {item.rotulo}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mt-auto">
          <Botao variante="texto" onClick={() => void sair()}>
            Sair
          </Botao>
        </div>
      </nav>

      <main className="min-w-0 flex-1 p-10">
        <Outlet />
      </main>
    </div>
  )
}
