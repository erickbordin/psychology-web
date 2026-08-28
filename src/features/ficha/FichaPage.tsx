import { useEffect, useId, useState } from 'react'
import { Link, useBlocker, useParams, useSearchParams } from 'react-router-dom'

import { ErroApi } from '../../api/erro'
import { Botao } from '../../ui/Botao'
import { dataCurta, dataDeSessao } from '../../ui/data'
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
  const idDoRascunho = useId()
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

  const anotacoesDaPagina = anotacoes.data?.content ?? []

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3 border-b border-linha pb-6">
        <Link
          to="/pacientes"
          className="w-fit text-sm font-medium text-acento underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento"
        >
          Voltar
        </Link>
        <h1 className="font-serif text-4xl leading-tight">
          {paciente.data?.nome ?? 'Carregando…'}
        </h1>
        {paciente.data ? (
          <p className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-tinta-2">
            {paciente.data.telefone ? <span>{paciente.data.telefone}</span> : null}
            <span>
              <span className="text-tinta-3">nascimento</span>{' '}
              {dataCurta(paciente.data.dataNascimento)}
            </span>
          </p>
        ) : null}
      </header>

      {bloqueio.state === 'blocked' ? (
        <div className="flex flex-col gap-4 border-l-2 border-atencao bg-superficie px-5 py-4">
          <p className="text-sm">Você tem uma anotação não enviada. Sair perde o texto.</p>
          <div className="flex flex-wrap items-center gap-6">
            <Botao onClick={() => bloqueio.reset()}>Continuar aqui</Botao>
            <Botao variante="texto" onClick={() => bloqueio.proceed()}>
              Sair sem salvar
            </Botao>
          </div>
        </div>
      ) : null}

      {/*
        O compositor e o unico bloco da pagina sem filete embaixo: a borda aberta
        e o modelo de dados aparecendo na tela. A trilha so cresce, e o que ja
        foi registrado esta selado — cada anotacao abaixo e fechada por um filete.
      */}
      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-4">
          <label htmlFor={idDoRascunho} className="text-sm font-medium text-tinta-2">
            Anotação da sessão
          </label>
          <span className="text-sm text-tinta-2">
            {total === 1 ? '1 anotação' : `${total} anotações`}
          </span>
        </div>
        <div className="border-l-2 border-acento pl-4">
          <textarea
            id={idDoRascunho}
            rows={4}
            value={rascunho}
            placeholder="O que aconteceu nesta sessão."
            onChange={(evento) => setRascunho(evento.target.value)}
            className="w-full resize-y bg-transparent font-serif text-[17px] leading-relaxed outline-none placeholder:font-sans placeholder:text-base placeholder:text-tinta-3"
          />
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Botao onClick={() => void registrar()} disabled={criar.isPending}>
            Registrar anotação
          </Botao>
          <span className="text-sm text-tinta-2">
            Depois de registrada, a anotação não pode ser editada nem apagada.
          </span>
        </div>
        {criar.error instanceof ErroApi ? (
          <p className="border-l-2 border-perigo bg-superficie px-4 py-3 text-sm">
            {criar.error.message}
          </p>
        ) : null}
      </section>

      <section className="flex flex-col gap-4">
        {anotacoesDaPagina.length === 0 ? (
          anotacoes.isPending ? null : (
            <p className="border-t border-linha py-16 text-center text-sm text-tinta-2">
              Nenhuma sessão registrada ainda.
            </p>
          )
        ) : (
          <ol className="border-t border-linha">
            {anotacoesDaPagina.map((anotacao) => (
              <li
                key={anotacao.id}
                className="grid gap-2 border-b border-linha py-6 sm:grid-cols-[7.5rem_1fr] sm:gap-7"
              >
                <span className="text-sm tabular-nums text-tinta-2">
                  {dataDeSessao(anotacao.createdAt)}
                </span>
                <p className="font-serif text-[17px] leading-relaxed">{anotacao.conteudo}</p>
              </li>
            ))}
          </ol>
        )}

        {totalPaginas > 1 ? (
          <div className="flex flex-wrap items-center gap-6">
            <Botao
              variante="texto"
              disabled={pagina === 0}
              onClick={() => setParametros({ page: String(Math.max(0, pagina - 1)) })}
            >
              Anterior
            </Botao>
            <Botao
              variante="texto"
              disabled={pagina >= totalPaginas - 1}
              onClick={() => setParametros({ page: String(Math.min(totalPaginas - 1, pagina + 1)) })}
            >
              Próxima
            </Botao>
            <span className="text-sm tabular-nums text-tinta-2">
              {`página ${pagina + 1} de ${totalPaginas} · ${total} anotações`}
            </span>
          </div>
        ) : null}
      </section>
    </div>
  )
}
