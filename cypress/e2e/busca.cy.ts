describe('Busca de contatos', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('busca contato por nome', () => {
    cy.get('.search__input').type('Ana Lima')
    cy.wait(3000)
    cy.get('.cell-identity__name').should('contain', 'Ana Lima')
  })

  it('busca contato por email', () => {
    cy.get('.search__input').type('joao@globex.io')
    cy.wait(3000)
    cy.get('.cell-identity__name').should('be.visible')
  })

  it('busca contato por empresa', () => {
    cy.get('.search__input').type('Initech')
    cy.wait(3000)
    cy.get('.cell-identity__name').should('contain', 'Marina Souza')
  })

  it('busca por usuario nao cadastrado', () => {
    cy.get('.search__input').type('hdcgygf')
    cy.wait(3000)
    cy.get('.empty').should('be.visible')
  })

  it('busca por telefone', () => {
    cy.get('.search__input').type('6525435')
    cy.wait(3000)
    cy.get('.empty').should('be.visible')
  })
})