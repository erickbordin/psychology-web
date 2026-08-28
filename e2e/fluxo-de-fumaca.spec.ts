import { expect, test } from '@playwright/test'

/**
 * E-mail unico por execucao: o cadastro responde 409 em e-mail repetido, e o
 * teste roda contra um banco que persiste entre execucoes.
 */
function emailUnico(): string {
  return `fumaca-${Date.now()}@teste.local`
}

test('registrar, entrar, cadastrar paciente e anotar a sessao', async ({ page }) => {
  const email = emailUnico()
  const senha = 'senhaforte123'

  await page.goto('/login')

  await page.getByRole('button', { name: 'Criar conta' }).click()
  await page.getByLabel('Nome').fill('Ana da Fumaça')
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill(senha)
  await page.getByRole('button', { name: 'Cadastrar' }).click()

  await expect(page.getByRole('heading', { name: 'Pacientes' })).toBeVisible()

  await page.getByRole('button', { name: 'Novo paciente' }).click()
  await page.getByLabel('Nome').fill('Paciente da Fumaça')
  await page.getByLabel('Data de nascimento').fill('1991-04-12')
  await page.getByRole('button', { name: 'Cadastrar' }).click()

  await page.getByRole('link', { name: /Paciente da Fumaça/ }).click()

  await expect(page.getByRole('heading', { name: 'Paciente da Fumaça' })).toBeVisible()

  const anotacao = 'Primeira sessão registrada pelo teste de fumaça.'
  await page.getByLabel('Anotação da sessão').fill(anotacao)
  await page.getByRole('button', { name: 'Registrar anotação' }).click()

  await expect(page.getByText(anotacao)).toBeVisible()
  await expect(page.getByText('1 anotação')).toBeVisible()
})
