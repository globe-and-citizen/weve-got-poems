import '../../support/command';

describe('Poem Creation Form Tests', () => {
  beforeEach(() => {
    cy.ensureLogin().then(() => {
      cy.visit('http://localhost:9000/poems/create');
    });
    // Update with the correct URL where the Poem Creation form is located
  });

  // it('loads the poem creation form', () => {
  //   cy.get('.my-card').should('contain', 'Poem Creation');
  //   cy.get('input[label="Title *"]').should('be.visible');
  //   cy.get('textarea[label="Content *"]').should('be.visible');
  // });

  it('allows poem creation  with valid data', () => {
    cy.get('[data-text="poem-title"]').type('Nature');
    cy.get('[data-text="poem-content"]').type(
      'The beauty of nature is often unsung by the busy'
    );

    cy.get('[data-text="poem-create-btn"]').click();
    cy.get('.q-notification__message').contains('Poem created successfully');
  });
});
