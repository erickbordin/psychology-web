type Props = {
  rotulo: string
  valor: string
  aoMudar: (valor: string) => void
  tipo?: 'text' | 'password'
  erro?: string
  exemplo?: string
}

export function Campo({ rotulo, valor, aoMudar, tipo = 'text', erro, exemplo }: Props) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm text-tinta-2">{rotulo}</span>
      <input
        type={tipo}
        value={valor}
        placeholder={exemplo}
        onChange={(evento) => aoMudar(evento.target.value)}
        className="border-b border-linha bg-transparent py-2 text-base outline-none focus:border-acento"
      />
      {erro ? <span className="text-sm text-perigo">{erro}</span> : null}
    </label>
  )
}
