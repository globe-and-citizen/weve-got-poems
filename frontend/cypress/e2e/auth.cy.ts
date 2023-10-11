// Import fakerjs
import { faker } from '@faker-js/faker'

describe('Login Page', () => {
  const randomName = faker.person.fullName() // Rowan Nikolaus
  const randomEmail = faker.internet.email() // Kassandra.Haley@erich.biz
  beforeEach(() => {
    cy.visit('/login')
  })

  it('Should login when sign in with valid data', () => {
    cy.get('#email').type('test@doe.com')
    cy.get('#password').type('password123')
    cy.get('[data-test="login-button"]').click()

    // check login successfull message
    cy.get('[data-cy="notification"]').contains('Welcome to our platform!')

    // check the redirection to the home page
    cy.location('pathname').should('eq', '/')
  })

  it('Should fails login when try to login with invalid data', () => {
    cy.get('#email').type('test@doe')
    cy.get('#password').type('password123')
    cy.get('[data-test="login-button"]').click()

    // check login successfull message
    cy.get('[data-cy="notification"]').contains('Unable to login the user')

    // check there is no redirection to the home page
    cy.location('pathname').should('eq', '/login')
  })


  it('Should navigate to the register panel', () => {
    cy.contains('Sign in to your account')
    cy.get('[data-test="register"]').click()
    // check if we have sign in message
    cy.contains('Register your account')
    cy.get('[data-test="login"]').click()
    cy.contains('Sign in to your account')
  })

  it('Should register the new user', () => {
    cy.get('[data-test="register"]').click()
    cy.get('#email').type(randomEmail)
    cy.get('#password').type('password123')
    cy.get('#name').type(randomName)
    cy.get('[data-test="register-button"]').click()

    // check login successfully message
    cy.get('[data-cy="notification"]').contains('Welcome to our platform!')

    // check the redirection to the home page
    cy.location('pathname').should('eq', '/')
  })
  it('Should Failed to register the new user', () => {
    cy.get('[data-test="register"]').click()
    cy.get('#email').type('test@doedd.com')
    cy.get('#password').type('password123')
    cy.get('#name').type('John Doe')
    cy.get('[data-test="register-button"]').click()

    // check login successfully message
    cy.get('[data-cy="notification"]').contains('Unable to Register the user')

    // check the redirection to the home page
    cy.location('pathname').should('eq', '/login')
  })
})

