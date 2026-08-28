import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variante?: 'primario' | 'texto'
}

export function Botao({ children, variante = 'primario', ...resto }: Props) {
  const estilo =
    variante === 'primario'
      ? 'h-11 px-5 bg-tinta text-superficie text-sm disabled:opacity-40'
      : 'text-sm text-acento py-1 disabled:opacity-40'

  return (
    <button type="button" className={estilo} {...resto}>
      {children}
    </button>
  )
}
