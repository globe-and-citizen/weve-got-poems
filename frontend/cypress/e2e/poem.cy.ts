// Import fakerjs
import { faker } from '@faker-js/faker'


describe('Create Poem', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/')
  })

  it('Should create A Poem', () => {
    cy.get('[href="/poems/create"]').click()
    cy.get('#title').type(faker.lorem.sentence())
    cy.get('#content').type(faker.lorem.paragraph())
    cy.get('[data-test="save-poem-button"]').click()

    // check loading
    cy.get('[data-test="loader"]').should('be.visible')
    cy.get('[data-test="loader"]').should('not.exist')
    // check success message
    cy.get('[data-cy="notification"]').contains('Poem created successfully')
    // check redirection
    cy.location('pathname').should('not.eq', '/poems/create')
  })
  it('Should delete A Poem', () => {
    cy.visit('/')
    cy.get('[data-test="item"]').get('[data-test="item-heading"]').last().click()
    // check loading
    cy.get('[data-test="loader"]').should('not.exist')
    cy.get('[data-test="remove-poem-button"]').click()
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(true); // Accept the dialog
    });
    // check success message
    cy.get('[data-cy="notification"]').contains('Poem deleted successfully')
    // Check the redirection to the homme page
    cy.location('pathname').should('eq', '/')
  })
})

