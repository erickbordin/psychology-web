import type { EnvelopeDeErro, ErroCampo } from './tipos'

/**
 * Toda falha da API chega aqui. O envelope e unico desde a padronizacao do
 * backend, entao existe um caminho de parsing so — e a lista de erros e sempre
 * um array, mesmo quando vazia.
 */
export class ErroApi extends Error {
  readonly status: number
  readonly mensagem: string
  readonly erros: ErroCampo[]

  constructor(envelope: EnvelopeDeErro) {
    super(envelope.mensagem)
    this.name = 'ErroApi'
    this.status = envelope.status
    this.mensagem = envelope.mensagem
    this.erros = envelope.erros ?? []
  }

  /** Mensagem do campo, para o formulario marcar o input certo. */
  mensagemDoCampo(campo: string): string | undefined {
    return this.erros.find((erro) => erro.campo === campo)?.mensagem
  }
}
