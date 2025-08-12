// cypress/support/commands.js

Cypress.Commands.add('login', () => {
  const username = Cypress.env('username')
  const password = Cypress.env('password')

  cy.session([username, password], () => {
    cy.request({
      method: 'POST',
      url: '/api/authentication', // Adjust this to your actual login endpoint
      body: {
        username,
        password,
      },
    }).then(() => {
      cy.visit('/')
    })
  })
})

Cypress.Commands.add('getBySel', (selector, ...args) => {
    return cy.get(`[data-cy=${selector}]`, ...args)
}); 