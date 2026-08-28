import { useEffect, useState } from 'react'
import { Link, useBlocker, useParams, useSearchParams } from 'react-router-dom'

import { ErroApi } from '../../api/erro'
import { Botao } from '../../ui/Botao'
import { usePaciente } from '../pacientes/queries'
import { useAnotacoes, useCriarAnotacao } from './queries'

export function FichaPage() {
  const { pacienteId = '' } = useParams()
  const [parametros, setParametros] = useSearchParams()
  const pagina = Number(parametros.get('page') ?? '0')

  const paciente = usePaciente(pacienteId)
  const anotacoes = useAnotacoes(pacienteId, pagina)
  const criar = useCriarAnotacao(pacienteId)

  const [rascunho, setRascunho] = useState('')
  const temRascunho = rascunho.trim().length > 0

  /**
   * O rascunho vive so em memoria — anotacao clinica nao fica em claro no
   * navegador. Isso obriga a guarda: sem ela, "em memoria" viraria "perde em
   * silencio" numa navegacao acidental.
   */
  const bloqueio = useBlocker(temRascunho)

  useEffect(() => {
    if (!temRascunho) return

    function avisar(evento: BeforeUnloadEvent) {
      evento.preventDefault()
    }

    window.addEventListener('beforeunload', avisar)
    return () => window.removeEventListener('beforeunload', avisar)
  }, [temRascunho])

  async function registrar() {
    if (!temRascunho) return
    try {
      await criar.mutateAsync(rascunho)
      setRascunho('')
    } catch (problema) {
      if (!(problema instanceof ErroApi)) throw problema
    }
  }

  const total = anotacoes.data?.page.totalElements ?? 0
  const totalPaginas = anotacoes.data?.page.totalPages ?? 1

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Link to="/pacientes" className="font-mono text-xs tracking-widest text-tinta-3">
          Voltar
        </Link>
        <h1 className="font-serif text-4xl font-light">
          {paciente.data?.nome ?? 'Carregando…'}
        </h1>
        {paciente.data ? (
          <p className="text-sm text-tinta-2">
            {paciente.data.telefone ?? 'sem telefone'} · {paciente.data.dataNascimento}
          </p>
        ) : null}
      </header>

      {bloqueio.state === 'blocked' ? (
        <div className="flex flex-col gap-3 border-l-2 border-atencao bg-superficie p-4">
          <p className="text-sm">Você tem uma anotação não enviada. Sair perde o texto.</p>
          <div className="flex gap-4">
            <Botao onClick={() => bloqueio.proceed()}>Sair sem salvar</Botao>
            <Botao variante="texto" onClick={() => bloqueio.reset()}>
              Continuar aqui
            </Botao>
          </div>
        </div>
      ) : null}

      <section className="flex max-w-2xl flex-col gap-3">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-tinta-2">Anotação da sessão</span>
          <textarea
            rows={4}
            value={rascunho}
            onChange={(evento) => setRascunho(evento.target.value)}
            className="border border-linha bg-superficie p-4 text-sm outline-none focus:border-acento"
          />
        </label>
        <div className="flex items-center gap-4">
          <Botao onClick={() => void registrar()}>Registrar anotação</Botao>
          <span className="text-xs text-tinta-3">
            Anotação não tem PUT — o histórico não é editável.
          </span>
        </div>
        {criar.error instanceof ErroApi ? (
          <p className="text-sm text-perigo">{criar.error.message}</p>
        ) : null}
      </section>

      <section className="flex max-w-2xl flex-col gap-3">
        <p className="text-sm text-tinta-2">
          {total === 1 ? '1 anotação' : `${total} anotações`}
        </p>

        <ul className="flex flex-col gap-px">
          {(anotacoes.data?.content ?? []).map((anotacao) => (
            <li key={anotacao.id} className="flex gap-5 bg-superficie p-5">
              <span className="font-mono text-xs text-tinta-3">{anotacao.createdAt}</span>
              <span className="text-sm leading-relaxed">{anotacao.conteudo}</span>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          <Botao
            variante="texto"
            onClick={() => setParametros({ page: String(Math.max(0, pagina - 1)) })}
          >
            Anterior
          </Botao>
          <Botao
            variante="texto"
            onClick={() => setParametros({ page: String(Math.min(totalPaginas - 1, pagina + 1)) })}
          >
            Próxima
          </Botao>
          <span className="font-mono text-xs text-tinta-3">
            {`página ${pagina + 1} de ${totalPaginas} · ${total} anotações`}
          </span>
        </div>
      </section>
    </div>
  )
}
