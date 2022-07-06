const { 
  register,
  load_config,
  load_tls_ini,
  hook_capabilities,
  buildOptions,
  checkUserValid,
  checkAuthFromServer,
  buildCheckPlainPasswdFunc
} = require('../index');

const statusCodes = {
  OK: 200,
  BAD: 500
};

describe('register', () => {
  // calls inherits
  // calls load_tls_ini
  // calls load_config
});

describe('load_config', () => {
  // plugin config to be set
  // the get method was called with correct params
  // expect()
});

describe('load_tls_ini', () => {

});

describe('hook_capabilities', () => {

});

describe('checkAuthFromServer', () => {

});

describe('checkUserValid', () => {

});

describe('buildOptions', () => {

});