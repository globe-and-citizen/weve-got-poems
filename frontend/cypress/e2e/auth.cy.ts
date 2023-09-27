describe('template spec', () => {

  beforeEach(() => {
    cy.visit('/login')
  })

  it('passes', () => {
    cy.get('#email').type('test@doe.com')
    cy.get('#password').type('password123')
    cy.get('[data-test="login-button"]').click()

    // check login successfull message
    cy.get('[data-cy="notification"]').contains('Welcome to our platform!')

    // check the redirection to the home page
    cy.location('pathname').should('eq', '/')
  })

  it('fails', () => {
    cy.get('#email').type('test@doe')
    cy.get('#password').type('password123')
    cy.get('[data-test="login-button"]').click()

    // check login successfull message
    cy.get('[data-cy="notification"]').contains('Unable to login the user')

    // check there is no redirection to the home page
    cy.location('pathname').should('eq', '/login')
  })


})

