const btnNovoContato = '.app__header-right > .btn'
const btnSalvar = '.cform__actions > .btn--primary'
  

describe('Gerenciamento de contatos', () => {
  beforeEach(() => {
    cy.visit('/')
 })
  it('cadastra um novo contato', () => {
    cy.get(btnNovoContato).click()
    cy.get('[name="name"]').type('Karine')
    cy.get('[name="email"]').type('karine@email.com')
    cy.get('[name="phone"]').type('92994647034')
    cy.get('[name="company"]').type('Anthropic')
    cy.get('[name="role"]').type('QAA')
    cy.get('[name="notes"]').type('Contato de teste')
    cy.get(btnSalvar).click()
    cy.wait(2000)
    cy.get('.cell-identity__name').should('contain', 'Karine')
  })
})