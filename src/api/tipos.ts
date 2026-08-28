export type ErroCampo = { campo: string; mensagem: string }

export type EnvelopeDeErro = {
  status: number
  mensagem: string
  erros: ErroCampo[]
}

export type Pagina<T> = {
  content: T[]
  page: { size: number; number: number; totalElements: number; totalPages: number }
}

export type TokenResposta = { token: string }

export type Paciente = {
  idPaciente: string
  idUsuario: string
  nome: string
  email: string | null
  telefone: string | null
  dataNascimento: string
  createdAt: string
}

export type NovoPaciente = {
  nome: string
  telefone?: string
  email?: string
  dataNascimento: string
}

export type Anotacao = {
  id: string
  conteudo: string
  createdAt: string
  pacienteId: string
}
