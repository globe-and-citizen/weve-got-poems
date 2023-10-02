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
})

