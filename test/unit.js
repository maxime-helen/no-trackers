/* eslint-disable global-require */

import 'should';
import mockery from 'mockery';

mockery.enable({
  warnOnReplace: false,
  warnOnUnregistered: false,
});

let retrieveAllHostnamesByCategories; let
  retrieveAllHostnamesByCompanyNames;

describe('Unit test suit', () => {
  beforeEach('Mock Polly', () => {
    const Polly = function Polly() {};
    Polly.register = () => {};

    mockery.registerMock('@pollyjs/core', {
      Polly,
    });
    const utils = require('../index');
    retrieveAllHostnamesByCategories = utils.retrieveAllHostnamesByCategories;
    retrieveAllHostnamesByCompanyNames = utils.retrieveAllHostnamesByCompanyNames;
  });

  afterEach('Cleanup', () => {
    mockery.deregisterMock('@pollyjs/core');
    retrieveAllHostnamesByCategories = undefined;
    retrieveAllHostnamesByCompanyNames = undefined;
  });

  after('Disable mockery', () => {
    mockery.disable();
  });

  it('retrieveAllHostnamesByCategories() formats well disconnect blacklist', () => {
    const hostnames = retrieveAllHostnamesByCategories([
      'Advertising',
      'Content',
      'Analytics',
      'FingerprintingInvasive',
      'FingerprintingGeneral',
      'Social',
      'Cryptomining',
    ]);
    hostnames.should.containDeep([
      'adition.com',
      'papayamobile.com',
      'activengage.com',
      '63squares.com',
      'adabra.com',
      '2o7.net',
      'xgraph.net',
      'alflying.date',
    ]);
  });

  it('retrieveAllHostnamesByCompanyNames() formats well disconnect blacklist', () => {
    const hostnames = retrieveAllHostnamesByCompanyNames(['Adbot', 'YSance', 'Causes']);
    hostnames.should.containDeep([
      'adbot.tw',
      'y-track.com',
      'causes.com',
    ]);
  });
});
