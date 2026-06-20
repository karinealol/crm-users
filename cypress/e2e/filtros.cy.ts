describe('Filtros de status', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('verifica se a lista de contatos carrega', () => {
    cy.wait(3000)
    cy.get('.cell-identity__name').should('be.visible')
  })

  it('filtra por status e volta para todos', () => {
    cy.get('[data-value="ativo"]').click()
    cy.get('.cell-identity__name').should('be.visible')

    cy.get('[data-value="inativo"]').click()
    cy.get('.cell-identity__name').should('be.visible')

    cy.get('[data-value="all"]').click()
    cy.get('.cell-identity__name').should('be.visible')
  })
})