require('dotenv').config();
Cypress.Commands.add(
  'ensureLogin',
  (
    loginUrl = 'http://localhost:9000/login',
    buttonSelector = '[data-test="sign-button"]',
    notificationSelector = '.q-notification__message',
  ) => {
    cy.visit(loginUrl).then(() => {
      cy.log(`Navigated to ${loginUrl}`);
    });

    cy.get(buttonSelector).then(($btn) => {
      const htmlContent = $btn.html();
      if (htmlContent.toLocaleLowerCase().includes('sign in')) {
        $btn.click();
        cy.confirmMetamaskSignatureRequest().then(() => {
          // Assert the notification message to confirm successful login
          cy.get(notificationSelector).should(
            'contain',
            'You have successfully logged in',
          );
        });
      }
    });
  },
);

Cypress.Commands.add('clearCache', () => {
  cy.clearAllCookies();
  cy.clearAllLocalStorage();
  cy.clearAllSessionStorage();

  //cy.clearCookies();
  //cy.clearLocalStorage();
  //cy.clearIndexedDB(); // Important for clearing MetaMask data specifically
});

Cypress.Commands.add(
  'ensureLogout',
  (
    loginUrl = 'http://localhost:9000/login',
    buttonSelector = '[data-test="sign-button"]',
    notificationSelector = '.q-notification__message',
  ) => {
    cy.visit(loginUrl).then(() => {
      cy.log(`Navigated to ${loginUrl}`);
    });

    cy.get(buttonSelector).then(($btn) => {
      const htmlContent = $btn.html();
      if (htmlContent.toLocaleLowerCase().includes('logout')) {
        $btn.click();
        // Wait for the login request to complete

        // Assert the notification message to confirm successful login
        cy.get(notificationSelector).should(
          'contain',
          'You have successfully logged out',
        );
      }
    });
  },
);

Cypress.Commands.add(
  'switchAccount',
  (
    address = 'Account 2',
    private_key = 'e836cc51b40d2abee4516e970c56b7b182a41b906ba26196893329e0add1c127',
  ) => {
    cy.getMetamaskWalletAddress().then((currentAddress) => {
      if (currentAddress !== address) {
        // The address does not match
        cy.log('The wallet address does not match the expected address.');
        cy.importMetamaskAccount(private_key)
        cy.switchMetamaskAccount('Account 2')
        
        // cy.isMetamaskWindowActive().then((result) => {
        //   if (result) {
        //     //let's cancel
        //     cy.get(
        //       '.new-account .new-account-create-form__button:nth-child(1)',
        //     ).click();
        //   }
        //   cy.switchMetamaskAccount(address);
        //   cy.log('account switched successfully');
        // });
      } else {
        // The address matches
        cy.log('The wallet address matches the expected address.');
      }
    });
  },
);

//const notificationPage = '.notification';
// `${notificationPage} .request-signature__footer__sign-button`;
