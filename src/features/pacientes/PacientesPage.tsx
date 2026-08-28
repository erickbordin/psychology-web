import { useState } from 'react'
import { Link } from 'react-router-dom'

import { ErroApi } from '../../api/erro'
import { Botao } from '../../ui/Botao'
import { Campo } from '../../ui/Campo'
import { useCriarPaciente, usePacientes } from './queries'

export function PacientesPage() {
  const { data: pacientes, isPending, error } = usePacientes()
  const criar = useCriarPaciente()
  const [criando, setCriando] = useState(false)
  const [nome, setNome] = useState('')
  const [nascimento, setNascimento] = useState('')
  const [vazios, setVazios] = useState<string[]>([])

  const falha = criar.error instanceof ErroApi ? criar.error : null

  function erroDoCampo(campo: string, valorDoCampo: string): string | undefined {
    if (vazios.includes(campo) && !valorDoCampo.trim()) return 'campo obrigatorio'
    return falha?.mensagemDoCampo(campo)
  }

  async function cadastrar() {
    const faltando = [
      ...(nome.trim() ? [] : ['nome']),
      ...(nascimento.trim() ? [] : ['dataNascimento']),
    ]
    setVazios(faltando)
    if (faltando.length > 0) return

    try {
      await criar.mutateAsync({ nome, dataNascimento: nascimento })
      setCriando(false)
      setNome('')
      setNascimento('')
    } catch (problema) {
      if (!(problema instanceof ErroApi)) throw problema
    }
  }

  const total = pacientes?.length ?? 0

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-end justify-between gap-6">
        <div className="flex flex-col gap-3">
          <p className="font-mono text-xs tracking-widest text-tinta-3">CADASTRO</p>
          <h1 className="font-serif text-4xl font-light">Pacientes</h1>
        </div>
        <Botao onClick={() => setCriando((antes) => !antes)}>Novo paciente</Botao>
      </header>

      {criando ? (
        <section className="flex max-w-md flex-col gap-5 border border-linha bg-superficie p-6">
          <p className="font-mono text-xs tracking-widest text-tinta-3">POST /pacientes</p>
          <Campo rotulo="Nome" valor={nome} aoMudar={setNome} erro={erroDoCampo('nome', nome)} />
          <Campo
            rotulo="Data de nascimento"
            valor={nascimento}
            aoMudar={setNascimento}
            exemplo="1991-04-12"
            erro={erroDoCampo('dataNascimento', nascimento)}
          />
          <Botao onClick={() => void cadastrar()} disabled={criar.isPending}>
            Cadastrar
          </Botao>
        </section>
      ) : null}

      {isPending ? <p className="text-sm text-tinta-3">Carregando…</p> : null}
      {error ? <p className="text-sm text-perigo">{(error as Error).message}</p> : null}

      {pacientes ? (
        <section className="flex flex-col gap-3">
          <p className="text-sm text-tinta-2">
            {total === 1 ? '1 paciente' : `${total} pacientes`}
          </p>

          {total === 0 ? (
            <p className="py-14 text-center text-sm text-tinta-3">
              Nenhum paciente cadastrado ainda.
            </p>
          ) : (
            <ul className="flex flex-col gap-px">
              {pacientes.map((paciente) => (
                <li key={paciente.idPaciente} className="bg-superficie">
                  <Link
                    to={`/pacientes/${paciente.idPaciente}`}
                    className="flex items-center justify-between gap-6 px-5 py-4 text-sm"
                  >
                    <span>{paciente.nome}</span>
                    <span className="font-mono text-xs text-tinta-3">{paciente.dataNascimento}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  )
}
