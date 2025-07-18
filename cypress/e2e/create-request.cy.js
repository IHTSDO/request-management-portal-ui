describe('Create Request', () => {
    beforeEach(() => {
        cy.login();
        cy.visit('/be'); 
    });

    it('should create a new request and see it in the list', () => {
        const requestSummary = `Cypress Test Request - ${new Date().getTime()}`;

        cy.getBySel('new-request-button').click();

        cy.url().should('include', '/be/new-request');

        cy.getBySel('summary-input').type(requestSummary);
        cy.getBySel('type-select').select('add-concept');
        cy.getBySel('new-fsn-input').type('Cypress test FSN');
        cy.getBySel('new-pt-input').type('Cypress test PT');

        cy.getBySel('save-button').click();

        cy.url().should('not.include', 'new-request');
        
        cy.getBySel('request-list').should('contain', requestSummary);
    });
}); 