'use strict';

describe('Main View', function() {
  var page;

  beforeEach(function() {
    browser.get('/');
    page = require('./main.po');
  });

  it('should include jumbotron with correct data', function() {
    expect(page.h1El.getText()).toBe('Got Data?');
    expect(page.imgEl.getAttribute('src')).toMatch(/assets\/images\/figure.png$/);
    expect(page.imgEl.getAttribute('alt')).toBe('This is figure.');
  });
});
