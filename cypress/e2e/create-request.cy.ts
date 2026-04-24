import Utils from '../commands/Utils';

const utils = new Utils();

describe('Create Request', () => {

    it('should be able to login', () => {
        utils.login();
    });

    it('should create a new request and see it in the list', () => {
        const requestSummary = `Cypress Test Request - ${new Date().getTime()}`;

        cy.contains('Belgium').click();

        cy.dataCy('new-request-button').click();

        cy.url().should('include', '/be/new-request');

        cy.dataCy('summary-input').type(requestSummary);
        cy.dataCy('type-select').select('add-concept');
        cy.dataCy('new-fsn-input').type('Cypress test FSN');
        cy.dataCy('new-pt-input').type('Cypress test PT');
        cy.dataCy('parent-concept-input').type('272379006');
        cy.dataCy('reference-input').type('Cypress test reference');

        cy.dataCy('submit-button').click();

        cy.url().should('not.include', 'new-request');
        cy.dataCy('request-list').should('contain', requestSummary);
    });

    it('should be able to log out', () => {
        cy.dataCy('user-menu').click({force: true});
        utils.logout();
    });
}); 
