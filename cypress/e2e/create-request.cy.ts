import Utils from '../commands/Utils';

const utils = new Utils();

describe('Create Request', () => {

    const requestSummary = `Cypress Test Request - ${new Date().getTime()}`;

    it('should be able to login', () => {
        utils.login();
    });

    it('should create a new request and see it in the list', () => {
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

    it('should be able to delete a request', () => {
        cy.intercept('DELETE', '/authoring-services/rmp-tasks/*').as('deleteRequest');
        cy.intercept('GET', '/authoring-services/rmp-tasks/search*').as('loadRequests');

        cy.dataCy('request-list').contains(requestSummary).siblings().find('[data-cy="delete-request"]').click();
        cy.dataCy('delete-button').click();

        cy.wait('@deleteRequest');
        cy.wait('@loadRequests');
        cy.dataCy('request-list').should('not.contain', requestSummary);
    });

    it('should be able to log out', () => {
        cy.dataCy('user-menu').click({force: true});
        utils.logout();
    });
}); 
