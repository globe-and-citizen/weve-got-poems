import '../../support/command';

describe('should load poems admin', () => {
  beforeEach(() => {
    cy.visit('http://localhost:9000/poems/admin/list'); // adjust the URL to wherever your poems component is hosted
  });

  it('displays the poems table with all required elements', () => {
    cy.get('.q-table').should('be.visible');
    //cy.get('[data-test="poems-filter"]').should('be.visible');
    cy.get('input[placeholder="Search"]').should('be.visible');
  });

  // it('should allow filtering poems', () => {
  //   const filterOption = 'All Poems'; // Example filter option
  //   cy.get('div.q-select').click();
  //   cy.get('.q-menu').contains(filterOption).click();
  //   cy.get('.q-table').should('contain', filterOption); // Assuming the table will reflect this filter
  // });

  it('should allow searching for a specific poem', () => {
    cy.get('input[placeholder="Search"]').type('If{enter}');
    cy.get('.q-table').should('contain', 'If'); // Assuming the table will show results containing 'Nature'
  });

  it('should open and display poem content when view button is clicked', () => {
    cy.get('.q-btn').contains('visibility').first().click(); // Assuming 'visibility' is unique to view buttons
    cy.get('.q-dialog').should('contain', 'Poem Content').and('be.visible');
    //let's close the popup after..
    cy.wait(3000);
    cy.get('.q-btn').contains('Cancel').first().click();
  });

  it('should refuse a crypto payment when the payment button is clicked but user not connected', () => {
    // @ts-ignore
    cy.ensureLogout().then(() => {
      cy.visit('http://localhost:9000/poems/admin/list');
      cy.wait(4000);
      cy.get('.q-btn').contains('payment').first().click(); // Adjust if the icon name isn't directly usable
      cy.get('.q-notification__message').contains('login');
      // cy.get('.q-dialog')
      //   .should('contain', 'Payment Confirmation')
      //   .and('be.visible');
    });
  });

  it("should refuse a crypto payment when the payment button is clicked but the author don't set wallet address", () => {
    // @ts-ignore
    cy.ensureLogin().then(() => {
      cy.visit('http://localhost:9000/poems/admin/list');
      cy.wait(4000);
      cy.get('.q-btn').contains('payment').first().click(); // Adjust if the icon name isn't directly usable
      cy.get('.q-notification__message').contains(
        "the author don't set a wallet address",
      );
    });

    // cy.get('.q-dialog')
    //   .should('contain', 'Payment Confirmation')
    //   .and('be.visible');
  });

  // it('should refuse a crypto payment for an invalid wallet address', () => {
  //   cy.ensureLogin().then(() => {
  //     cy.visit('http://localhost:9000/poems/admin/list').then(() => {
  //       cy.wait(4000);

  //       cy.get('.q-table tr').each(($row) => {
  //         // Assume 'data-wallet-address' is an attribute you might need to add to your component for testing
  //         const ethAddress = $row.find('td').first().text();
  //         //const ethAddress = $row.find('[data-author]').text();
  //         cy.log('the eth Address== ', ethAddress);
  //         if (ethAddress.length < 42) {
  //           cy.wrap($row).find('.q-btn').contains('payment').click();
  //           cy.get('.q-notification__message').contains(
  //             "the author don't set a wallet address"
  //           );
  //           return 0;

  //           //cy.wrap($row).get('.q-btn').contains('payment').click();
  //           // cy.get('.q-notification__message').contains(
  //           //   "the author don't set a wallet address"
  //           // );
  //         }
  //       });
  //     });
  //   });
  // });

  it("should refuse a crypto payment when the payment button is clicked but  the author don't set wallet address", () => {
    cy.ensureLogin().then(() => {
      cy.visit('http://localhost:9000/poems/admin/list');
      cy.wait(4000);
      cy.get('.q-btn').contains('payment').first().click(); // Adjust if the icon name isn't directly usable
      cy.get('.q-notification__message').contains(
        "the author don't set a wallet address",
      );
    });

    // cy.get('.q-dialog')
    //   .should('contain', 'Payment Confirmation')
    //   .and('be.visible');
  });

  it('should refuse a crypto payment when sender and receiver are same', () => {
    cy.ensureLogin().then(() => {
      cy.visit('http://localhost:9000/poems/admin/list').then(() => {
        cy.wait(4000);
        let shouldStop = false;
        if (shouldStop == false) {
          cy.get('.q-table tr').each(($row) => {
            // Assume 'data-wallet-address' is an attribute you might need to add to your component for testing
            const ethAddress = $row.find('td').first().text();
            //const ethAddress = $row.find('[data-author]').text();
            cy.log('the eth Address== ', ethAddress);

            if (ethAddress.length >= 42 && shouldStop == false) {
              if (cy.wrap($row.find('.q-btn')).contains('edit')) {
                cy.wrap($row.find('.q-btn')).contains('payment').click();
                cy.get('.q-notification__message').contains(
                  "sender and receiver should have different wallet address: you can't sender money yo your self",
                );
                shouldStop = true;
              }
              //cy.wrap($row).get('.q-btn').contains('payment').click();
              // cy.get('.q-notification__message').contains(
              //   "the author don't set a wallet address"
              // );
            }
          });
        }
      });
    });
  });

  
});
