describe('Language Switch', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/');
  });

  it('should switch language to German and verify dashboard title', () => {
    cy.getBySel('language-menu-button').click();
    cy.getBySel('language-option-de').click();
    cy.getBySel('dashboard-title').should('contain', 'Anforderungs-Management-Portal');
  });
}); 