
describe('template spec', () => {

  beforeEach(() => {
    cy.visit('/login')
  })

  it('passes', () => {
    cy.get('#email').type('test@doe.com')
    cy.get('#password').type('password123')
    cy.get('[data-test="login-button"]').click()

    // check login successfull message
    cy.get('[data-test="login-success"]').should('be.visible')
  })

})

