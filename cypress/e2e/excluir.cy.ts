describe('Exclusão de contatos', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('cancela a exclusão de um contato', () => {
    cy.get('.cell-identity__name').then(($el) => $el.length).then((totalAntes) => {
      cy.get('.icon-btn--danger').first().click()
      cy.get('.btn--ghost').contains('Cancelar').click()
      cy.get('.cell-identity__name').should('have.length', totalAntes)
    })
  })

  it('confirma a exclusão de um contato', () => {
    cy.get('.cell-identity__name').then(($el) => $el.length).then((totalAntes) => {
      cy.get('.icon-btn--danger').first().click()
      cy.get('.btn--danger').contains('Excluir').click()
      cy.get('.cell-identity__name').should('have.length', totalAntes - 1)
    })
  })
})