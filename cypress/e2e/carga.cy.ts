describe('Carga de contatos', () => {
  const btnNovoContato = '.app__header-right > .btn'
  const btnSalvar = '.cform__actions > .btn--primary'

  beforeEach(() => {
    cy.visit('/')
  })

  it('cria 10 contatos', () => {
    const nomes = [
      'Ana Silva', 'Bruno Costa', 'Carla Souza',
      'Diego Lima', 'Elena Rocha', 'Felipe Santos',
      'Gabriela Nunes', 'Henrique Alves', 'Isabela Martins', 'João Ribeiro'
    ]

    nomes.forEach((nome, index) => {
      cy.get(btnNovoContato).click()
      cy.get('[name="name"]').type(nome)
      cy.get('[name="email"]').type(`contato${index + 1}@email.com`)
      cy.get(btnSalvar).click()
      cy.wait(1000)
    })

    cy.get('.cell-identity__name').should('have.length.at.least', 10)
  })
})