/* eslint-disable cypress/unsafe-to-chain-command */
/* eslint-disable cypress/no-unnecessary-waiting */
/// <reference types="cypress" />
// Use `cy.dataCy` custom command for more robust tests
// See https://docs.cypress.io/guides/references/best-practices.html#Selecting-Elements


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
    // check redirection to the poem page
    cy.location('pathname', { timeout: 5000 }).should('match', /\/poems\/\d+/)
  })
  describe('Given Existing Poem ', () => {
    beforeEach('When Visit the author First poem', () => {
      cy.visit('/')
      cy.get('[data-test="my-poem"]', { timeout: 20000 }).first().within(() => {
        cy.get('[data-test="item-heading"]').click()
      })
      // check loading
      cy.get('[data-test="loader"]').should('not.exist')
    })
    it('Should update A Poem', () => {
      // Click on edit button
      cy.get('[data-test="update-poem-button"]').click()

      // Check the redirection to the edit page
      // check the path match the regex
      cy.location('pathname').should('match', /\/poems\/\d+\/update/)

      // Update the title
      cy.get('#title').clear().type(faker.lorem.sentence())
      cy.get('#content').clear().type(faker.lorem.paragraph())
      cy.get('[data-test="save-poem-button"]').click()

      // check loading
      cy.get('[data-test="loader"]').should('be.visible')
      cy.get('[data-test="loader"]').should('not.exist')

      // check success message
      cy.get('[data-cy="notification"]').contains('Poem updated successfully')

      // Check the redirection to the poem page
      // check the path match the regex
      cy.location('pathname', { timeout: 5000 }).should('match', /\/poems\/\d+/)

    })

    it('Should delete A Poem', () => {
      cy.get('[data-test="remove-poem-button"]').click()
      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(true) // Accept the dialog
      })
      // check success message
      cy.get('[data-cy="notification"]').contains('Poem deleted successfully')
      // Check the redirection to the homme page
      cy.location('pathname').should('eq', '/')
    })
  })

})

