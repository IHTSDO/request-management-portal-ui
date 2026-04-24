import Utils from '../commands/Utils';

const utils = new Utils();

describe('Language Switch', () => {

  it('should be able to login', () => {
    utils.login();
  });

  it('should switch language to German and verify dashboard title', () => {
    cy.dataCy('language-menu-button').click();
    cy.dataCy('language-option-de').click();
    cy.dataCy('home-title').should('contain', 'Anforderungsverwaltungsportal');
  });

  it('should be able to log out', () => {
    cy.dataCy('user-menu').click({force: true});
    utils.logout();
  });

}); 
