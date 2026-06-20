describe('Validações do formulário', () => {
  const btnNovoContato = '.app__header-right > .btn'
  const btnSalvar = '.cform__actions > .btn--primary'

  beforeEach(() => {
    cy.visit('/')
    cy.get(btnNovoContato).click()
  })

  it('não deve salvar sem nome', () => {
    cy.get('[name="email"]').type('teste@email.com')
    cy.get(btnSalvar).click()
    cy.get('#err-name').should('be.visible')
  })

  it('não deve salvar sem email', () => {
    cy.get('[name="name"]').type('Karine')
    cy.get(btnSalvar).click()
    cy.get('#err-email').should('be.visible')
  })

  it('não deve salvar sem nenhum campo', () => {
    cy.get(btnSalvar).click()
    cy.get('#err-name').should('be.visible')
    cy.get('#err-email').should('be.visible')
  })
})