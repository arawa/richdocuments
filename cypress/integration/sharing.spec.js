/**
 * @copyright Copyright (c) 2019 John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @author John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

import { randHash } from '../utils/'
const owner = randHash()
const recipient = randHash()

const exampleFiles = [
	'Data Requirements.odt',
];

describe('Files default view', function() {
	before(function () {
		// Init user
		cy.nextcloudCreateUser(owner, 'password')
		cy.nextcloudCreateUser(recipient, 'password')

		cy.login(owner, 'password')
		exampleFiles.forEach((file) => {
			cy.uploadFile(file)
		})


		cy.uploadFile('document.odt', 'application/vnd.oasis.opendocument.text')
		cy.uploadFile('spreadsheet.ods', 'application/vnd.oasis.opendocument.spreadsheet')
		cy.uploadFile('presentation.odp', 'application/vnd.oasis.opendocument.presentation')
		cy.uploadFile('drawing.odg', 'application/vnd.oasis.opendocument.drawing')

		cy.webdavMkcol('sharedFolder')
		cy.uploadFile('document.odt', 'application/vnd.oasis.opendocument.text', 'sharedFolder/document.odt')

		cy.nextcloudShareWithUser('/document.odt', recipient, 31)
		cy.nextcloudShareWithUser('/spreadsheet.odt', recipient, 31)
		cy.nextcloudShareWithUser('/presentation.odt', recipient, 31)
		cy.nextcloudShareWithUser('/drawing.odt', recipient, 31)
		cy.nextcloudShareWithUser('/sharedFolder', recipient, 31)

		// FIXME: files app is thowing the following error for some reason
		// Uncaught TypeError: Cannot read property 'protocol' of undefined
		// Same for appswebroots setting in tests
		cy.on('uncaught:exception', (err, runnable) => {
			return false
		})
	})
	beforeEach(function() {
		cy.login(owner, 'password')
	})

	it('Share by link read only', function () {
		cy.nextcloudShareLink('/' + exampleFiles[0], 1).then((response) => {
			cy.logout()
			cy.visit(Cypress.env('baseUrl') + '/index.php/s/' + response.body.ocs.data.token)
			cy.wait(5000)

			cy.get('#richdocumentsframe').iframe().should('exist').as('collaboraframe')
			cy.get('@collaboraframe').within(() => {
				cy.get('#loleafletframe').iframe().should('exist').as('loleafletframe')
			})
			cy.get('@loleafletframe').find('#main-document-content').should('exist')
			cy.get('@loleafletframe').find('#toolbar-wrapper').should('not.be.visible')

			cy.screenshot('sharelink')
		})
	})

	it('Share by link', function () {
		cy.nextcloudShareLink('/' + exampleFiles[0], 19).then((response) => {
			cy.logout()
			cy.visit(Cypress.env('baseUrl') + '/index.php/s/' + response.body.ocs.data.token)

			cy.wait(1000)

			cy.get('#richdocumentsframe').iframe().should('exist').as('collaboraframe')
			cy.get('@collaboraframe').within(() => {
				cy.get('#nickname')
					.should('be.visible')
					.type('Guest Name{enter}')
				cy.wait(5000)

				cy.get('#loleafletframe').iframe().should('exist').as('loleafletframe')
			})
			cy.get('@loleafletframe').find('#main-document-content').should('exist')
			cy.get('@loleafletframe').find('#toolbar-wrapper').should('be.visible')

			cy.screenshot('sharelink')
		})
	})

	it('Share folder by link read only', function () {
		cy.nextcloudShareLink('/sharedFolder', 1).then((response) => {
			cy.logout()
			cy.visit(Cypress.env('baseUrl') + '/index.php/s/' + response.body.ocs.data.token)
			cy.wait(1000)

			cy.openFile('document.odt')
			cy.wait(2000)

			cy.get('#collaboraframe').iframe().should('exist').as('collaboraframe')
			cy.get('@collaboraframe').within(() => {
				cy.get('#loleafletframe').iframe().should('exist').as('loleafletframe')
			})
			cy.get('@loleafletframe').find('#main-document-content').should('exist')
			cy.get('@loleafletframe').find('#toolbar-wrapper').should('not.be.visible')

			cy.screenshot('sharelink')
		})
	})


	it('Share folder by link', function () {
		cy.nextcloudShareLink('/sharedFolder', 31).then((response) => {
			cy.logout()
			cy.visit(Cypress.env('baseUrl') + '/index.php/s/' + response.body.ocs.data.token)
			cy.wait(1000)

			cy.openFile('document.odt')
			cy.wait(2000)

			cy.get('#collaboraframe').iframe().should('exist').as('collaboraframe')
			cy.get('@collaboraframe').within(() => {
				cy.get('#nickname')
					.should('be.visible')
					.type('Guest Name{enter}')
				cy.wait(5000)

				cy.get('#loleafletframe').iframe().should('exist').as('loleafletframe')
			})
			cy.get('@loleafletframe').find('#main-document-content').should('exist')
			cy.get('@loleafletframe').find('#toolbar-wrapper').should('be.visible')

			cy.screenshot('sharelink')
		})
	})
})
