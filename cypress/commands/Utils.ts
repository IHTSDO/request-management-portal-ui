export default class Utils {
    loginTimeoutInSeconds = 30_000;

    url = Cypress.env('URL_RMP');
    username = Cypress.env('TEST_LOGIN_USR');
    password = Cypress.env('TEST_LOGIN_PSW');

    login(): void {
        cy.clearAllCookies();
        cy.visit(this.url);
        cy.contains('Welcome to SNOMED International', {timeout: 15000});
        cy.get('#username').clear();
        cy.get('#username').type(this.username);
        cy.get('#password').clear();
        cy.get('#password').type(this.password, {log: false});
        cy.get('input#kc-login', {timeout: this.loginTimeoutInSeconds}).click({force: true});
    }

    logout(): void {
        cy.contains('Logout').should('be.visible').click();
        cy.get('input#kc-logout').click();
        cy.clearAllCookies();
    }
}
