describe('Edição de contatos', () => {
  const btnSalvar = '.cform__actions > .btn--primary'

  beforeEach(() => {
    cy.visit('/')
  })

  it('edita os 3 contatos existentes', () => {
    const novosNomes = ['Ana Lima Editada', 'João Ribeiro Editado', 'Marina Souza Editada']

    novosNomes.forEach((nome, index) => {
      cy.get('[title="Editar"]').eq(index).click()
      cy.get('[name="name"]').clear().type(nome)
      cy.get(btnSalvar).click()
      cy.wait(1000)
    })

    cy.get('.cell-identity__name').should('contain', 'Ana Lima Editada')
    cy.get('.cell-identity__name').should('contain', 'João Ribeiro Editado')
    cy.get('.cell-identity__name').should('contain', 'Marina Souza Editada')
  })
})