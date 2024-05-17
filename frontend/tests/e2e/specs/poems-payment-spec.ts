import '../../support/command';

describe('should load poems admin', () => {
  beforeEach(() => {
    cy.visit('http://localhost:9000/poems/admin/list'); // adjust the URL to wherever your poems component is hosted
  });
  it('should initiate ethereum transaction ', () => {
    cy.intercept('GET', '**/v1/poems/**').as('apiPoems');
    cy.disconnectMetamaskWalletFromAllDapps();
    cy.switchAccount().then(() => {
      cy.ensureLogout().then(() => {
        cy.wait(4000);
        cy.ensureLogin().then(() => {
          cy.visit('http://localhost:9000/poems/admin/list').then(() => {
            cy.wait(4000);
            let shouldStop = false;
            if (shouldStop == false) {
              cy.get('.q-table tr').each(($row) => {
                // Assume 'data-wallet-address' is an attribute you might need to add to your component for testing
                const ethAddress = $row.find('td').first().text();
                //const ethAddress = $row.find('[data-author]').text();
                cy.log('current eth Address ====== ', ethAddress);
                if (ethAddress.length >= 42 && shouldStop == false) {
                  if (!$row.find('.q-btn').text().includes('edit')) {
                    cy.wrap($row.find('.q-btn')).contains('payment').click();

                    //cy.get('amount').should('contain', 'Poem Creation');
                    cy.get('[data-test="usd-amount"]').clear().type('1');

                    cy.get('[data-test="confirm-send-ether"]').click();
                    cy.confirmMetamaskPermissionToSpend({spendLimit:'0.5'});
                    cy.wait('@apiPoems');

                    cy.get('.q-notification__message').contains(
                      'Transaction created successfully',
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
  });
});
