import { screen } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'

import { reiniciarSessaoEmMemoria } from './api/sessaoEmMemoria'
import { definicaoDeRotas } from './rotas'
import { renderizarComRotas } from './teste/renderizar'
import { servidorDeTeste } from './teste/servidor'

describe('rotas', () => {
  beforeEach(() => reiniciarSessaoEmMemoria())

  it('sem sessao, a rota protegida manda para o login', async () => {
    servidorDeTeste.use(
      http.post('/auth/refresh', () =>
        HttpResponse.json({ status: 401, mensagem: 'sem sessao', erros: [] }, { status: 401 }),
      ),
    )

    renderizarComRotas(definicaoDeRotas, '/')

    expect(await screen.findByRole('heading', { name: 'Entrar' })).toBeInTheDocument()
  })

  it('com sessao, a rota protegida mostra o layout', async () => {
    servidorDeTeste.use(http.post('/auth/refresh', () => HttpResponse.json({ token: 'token-bom' })))

    renderizarComRotas(definicaoDeRotas, '/')

    expect(await screen.findByRole('navigation')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument()
  })

  it('mostra carregando enquanto o refresh do boot nao resolve', () => {
    servidorDeTeste.use(
      http.post('/auth/refresh', () =>
        HttpResponse.json({ status: 401, mensagem: 'sem sessao', erros: [] }, { status: 401 }),
      ),
    )

    renderizarComRotas(definicaoDeRotas, '/')

    expect(screen.getByText('Carregando…')).toBeInTheDocument()
  })

  it('caminho desconhecido mostra a mensagem de rota inexistente', async () => {
    servidorDeTeste.use(http.post('/auth/refresh', () => HttpResponse.json({ token: 'token-bom' })))

    renderizarComRotas(definicaoDeRotas, '/inexistente')

    expect(await screen.findByText('Página não encontrada.')).toBeInTheDocument()
  })
})
