import '../../support/command';

describe('poems lists', () => {
  before(() => {
    cy.visit('http://localhost:9000/poems');
  });

  it('displays a list of poems with at least one poem', () => {
    cy.get('[data-text="poems_list"]')
      .find('.q-item')
      .should('have.length.at.least', 1);
  });

  it('navigates between poems using Previous and Next buttons', () => {
    cy.get('[data-text="poems_list"] .q-item').first().click();
    // Save the initial title for comparison
    cy.get('[data-test="poem-heading"]')
      .invoke('text')
      .then((firstTitle) => {
        // Click 'Next' to see another poem
        cy.get('[data-text="selected_poem"] .q-btn').contains('Next').click();

        // Verify the poem content changes
        cy.get('[data-test="poem-heading"]').should(
          'not.have.text',
          firstTitle
        );

        // Click 'Previous' to go back to the first poem
        cy.get('[data-text="selected_poem"] .q-btn')
          .contains('Previous')
          .click();

        // Verify the poem title reverts to the original
        cy.get('[data-test="poem-heading"]').should('have.text', firstTitle);
      });
  });

  it('likes and dislikes poems without loged in ', () => {
    // @ts-ignore
    cy.ensureLogout().then(() => {
      cy.visit('http://localhost:9000/poems').then(() => {
        cy.get('[data-text="poems_list"] .q-item').first().click();

        // Click "Like" button if not already liked
        cy.get('.like-button').then(($likeButton) => {
          if (!$likeButton.is(':disabled')) {
            cy.wrap($likeButton).click();
            cy.get('.q-notification__message').contains('please login!');
            cy.wait(4000);
          }
        });

        // Click "Dislike" button if not already disliked
        cy.get('.dislike-button').then(($dislikeButton) => {
          if (!$dislikeButton.is(':disabled')) {
            cy.wrap($dislikeButton).click();
            cy.get('.q-notification__message').contains('please login!');
            cy.wait(4000);
          }
        });
      });
    });
  });

  it('likes and dislikes poems correctly', () => {
    // @ts-ignore
    cy.ensureLogin().then(() => {
      cy.visit('http://localhost:9000/poems').then(() => {
        // Capture the initial like count
        cy.get('[data-text="poems_list"] .q-item').first().click();

        cy.get('.like-button').then(($likeButton) => {
          cy.intercept('GET', '**/v1/poems/**').as('apiPoems');
          const initialLikes = parseInt($likeButton.text());
          cy.log('the inital like === ', initialLikes);

          if (!$likeButton.is(':disabled')) {
            cy.wrap($likeButton)
              .click()
              .then(() => {
                cy.wait('@apiPoems');
                cy.wait(4000);
                //get the new like
                cy.get('.like-button').then(($newlikeButton) => {
                  const newLikes = parseInt($newlikeButton.text());
                  cy.log('the new likes======== ', newLikes);
                  expect(initialLikes + 1).to.eq(newLikes);
                });
              });
          }
        });

        cy.get('.dislike-button').then(($likeButton) => {
          cy.intercept('GET', '**/v1/poems/**').as('apiPoems');
          const initialDisLikes = parseInt($likeButton.text());
          cy.log('the inital like === ', initialDisLikes);

          if (!$likeButton.is(':disabled')) {
            cy.wrap($likeButton)
              .click()
              .then(() => {
                cy.wait('@apiPoems');
                cy.wait(4000);
                //get the new like
                cy.get('.dislike-button').then(($newlikeButton) => {
                  const newDisLikes = parseInt($newlikeButton.text());
                  cy.log('the new dislikes======== ', newDisLikes);
                  expect(initialDisLikes + 1).to.eq(newDisLikes);
                });
              });
          }
        });

        // cy.get('.dislike-button')
        //   .invoke('text')
        //   .then((text) => {
        //     cy.intercept('GET', '**/v1/poems/**').as('apiPoems');
        //     const initialDisLikes = parseInt(text);
        //     cy.log('the inital dislike === ', initialDisLikes);
        //     cy.get('.dislike-button').then(($dislikeButton) => {
        //       if (!$dislikeButton.is(':disabled')) {
        //         cy.wrap($dislikeButton)
        //           .click()
        //           .then(() => {
        //             cy.wait('@apiPoems');
        //             cy.wait(4000);
        //             const newDisLikes = parseInt($dislikeButton.text());
        //             cy.log('the new dislikes === ', newDisLikes);
        //             expect(newDisLikes).to.eq(initialDisLikes + 1);
        //           });
        //       }
        //     });
        //   });
      });
    });
  });
});
