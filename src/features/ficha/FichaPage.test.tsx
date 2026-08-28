import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import type { RouteObject } from 'react-router-dom'

import { gravarAcesso, reiniciarSessaoEmMemoria } from '../../api/sessaoEmMemoria'
import { renderizarComRotas } from '../../teste/renderizar'
import { servidorDeTeste } from '../../teste/servidor'
import { FichaPage } from './FichaPage'

const ID = '3f9a1c04-0000-0000-0000-000000000001'

const PACIENTE = {
  idPaciente: ID,
  idUsuario: 'u-1',
  nome: 'Ana Moreira',
  email: 'ana@exemplo.br',
  telefone: '(51) 99612-0184',
  dataNascimento: '1991-04-12',
  createdAt: '2026-03-11T10:00:00',
}

function pagina(itens: { id: string; conteudo: string; createdAt: string }[], total = itens.length) {
  return {
    content: itens.map((item) => ({ ...item, pacienteId: ID })),
    page: { size: 20, number: 0, totalElements: total, totalPages: Math.max(1, Math.ceil(total / 20)) },
  }
}

const ROTAS: RouteObject[] = [
  { path: '/pacientes/:pacienteId', element: <FichaPage /> },
  { path: '/pacientes', element: <p>lista de pacientes</p> },
]

describe('FichaPage', () => {
  beforeEach(() => {
    reiniciarSessaoEmMemoria()
    gravarAcesso('token-de-teste')
    servidorDeTeste.use(http.get(`/pacientes/${ID}`, () => HttpResponse.json(PACIENTE)))
  })

  it('mostra o paciente e as anotacoes', async () => {
    servidorDeTeste.use(
      http.get(`/pacientes/${ID}/anotacoes`, () =>
        HttpResponse.json(
          pagina([{ id: 'a1', conteudo: 'Retomou o registro de sono.', createdAt: '2026-08-19' }]),
        ),
      ),
    )

    renderizarComRotas(ROTAS, `/pacientes/${ID}`)

    expect(await screen.findByRole('heading', { name: 'Ana Moreira' })).toBeInTheDocument()
    expect(await screen.findByText('Retomou o registro de sono.')).toBeInTheDocument()
    expect(screen.getByText('1 anotação')).toBeInTheDocument()
  })

  it('envia o campo anotacao no corpo, como o DTO exige', async () => {
    const corpos: unknown[] = []
    servidorDeTeste.use(
      http.get(`/pacientes/${ID}/anotacoes`, () => HttpResponse.json(pagina([]))),
      http.post(`/pacientes/${ID}/anotacoes`, async ({ request }) => {
        corpos.push(await request.json())
        return HttpResponse.json(
          { id: 'nova', conteudo: 'Sessão de hoje.', createdAt: '2026-08-26', pacienteId: ID },
          { status: 201 },
        )
      }),
    )

    renderizarComRotas(ROTAS, `/pacientes/${ID}`)
    await userEvent.type(await screen.findByLabelText('Anotação da sessão'), 'Sessão de hoje.')
    await userEvent.click(screen.getByRole('button', { name: 'Registrar anotação' }))

    await waitFor(() => expect(corpos).toEqual([{ anotacao: 'Sessão de hoje.' }]))
  })

  it('limpa o rascunho depois de registrar', async () => {
    servidorDeTeste.use(
      http.get(`/pacientes/${ID}/anotacoes`, () => HttpResponse.json(pagina([]))),
      http.post(`/pacientes/${ID}/anotacoes`, () =>
        HttpResponse.json(
          { id: 'nova', conteudo: 'Sessão de hoje.', createdAt: '2026-08-26', pacienteId: ID },
          { status: 201 },
        ),
      ),
    )

    renderizarComRotas(ROTAS, `/pacientes/${ID}`)
    const campo = await screen.findByLabelText('Anotação da sessão')
    await userEvent.type(campo, 'Sessão de hoje.')
    await userEvent.click(screen.getByRole('button', { name: 'Registrar anotação' }))

    await waitFor(() => expect(campo).toHaveValue(''))
  })

  /**
   * Anotacao nao tem PUT nem DELETE: uma gravacao duplicada por duplo clique
   * fica no historico para sempre. O botao trava enquanto o POST esta em voo.
   */
  it('trava o registro enquanto o POST esta em voo', async () => {
    let liberar: () => void = () => {}
    const emVoo = new Promise<void>((resolve) => {
      liberar = resolve
    })
    servidorDeTeste.use(
      http.get(`/pacientes/${ID}/anotacoes`, () => HttpResponse.json(pagina([]))),
      http.post(`/pacientes/${ID}/anotacoes`, async () => {
        await emVoo
        return HttpResponse.json(
          { id: 'nova', conteudo: 'Sessão de hoje.', createdAt: '2026-08-26', pacienteId: ID },
          { status: 201 },
        )
      }),
    )

    renderizarComRotas(ROTAS, `/pacientes/${ID}`)
    await userEvent.type(await screen.findByLabelText('Anotação da sessão'), 'Sessão de hoje.')
    const registrar = screen.getByRole('button', { name: 'Registrar anotação' })
    await userEvent.click(registrar)

    await waitFor(() => expect(registrar).toBeDisabled())
    liberar()
  })

  it('mostra o rodape de paginacao lendo page.totalElements', async () => {
    servidorDeTeste.use(
      http.get(`/pacientes/${ID}/anotacoes`, () =>
        HttpResponse.json(pagina([{ id: 'a1', conteudo: 'Uma.', createdAt: '2026-08-19' }], 42)),
      ),
    )

    renderizarComRotas(ROTAS, `/pacientes/${ID}`)

    expect(await screen.findByText('página 1 de 3 · 42 anotações')).toBeInTheDocument()
  })

  it('avisa antes de sair com rascunho pendente', async () => {
    servidorDeTeste.use(
      http.get(`/pacientes/${ID}/anotacoes`, () => HttpResponse.json(pagina([]))),
    )

    renderizarComRotas(ROTAS, `/pacientes/${ID}`)
    await userEvent.type(await screen.findByLabelText('Anotação da sessão'), 'texto nao enviado')
    await userEvent.click(screen.getByRole('link', { name: 'Voltar' }))

    expect(
      await screen.findByText('Você tem uma anotação não enviada. Sair perde o texto.'),
    ).toBeInTheDocument()
    expect(screen.queryByText('lista de pacientes')).not.toBeInTheDocument()
  })

  it('sem rascunho, sair navega direto', async () => {
    servidorDeTeste.use(
      http.get(`/pacientes/${ID}/anotacoes`, () => HttpResponse.json(pagina([]))),
    )

    renderizarComRotas(ROTAS, `/pacientes/${ID}`)
    await screen.findByLabelText('Anotação da sessão')
    await userEvent.click(screen.getByRole('link', { name: 'Voltar' }))

    expect(await screen.findByText('lista de pacientes')).toBeInTheDocument()
  })
})
