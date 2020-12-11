'use strict';

const regnetuserscontract = require('./users.js');
const regnetregistrarcontract = require('./registrar.js');

module.exports.regnetuserscontract = regnetuserscontract;
module.exports.regnetregistrarcontract = regnetregistrarcontract;

module.exports.contracts = [regnetuserscontract,regnetregistrarcontract];
