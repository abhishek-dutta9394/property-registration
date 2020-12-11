'use strict';

const {Contract} = require('fabric-contract-api');

class RegnetRegistrarContract extends Contract {

  constructor() {
		// Provide a custom name to refer to this smart contract
		super('org.property-registration-network.com.regnetregis');
	}

  /**
   * This is a common user defined function initiated during
   * the instantiation of the smart contract
   */
async instantiateRegistrar(ctx) {
  console.log('Registrar Instantiated for Property Registration Smart Contract.');
  console.log(ctx.clientIdentity.getID());
}

/**
* This function is used to approve new users upon request.
* @param ctx - The transaction context object
* @param name - Name of the requested user
* @param aadharNumber - Aadhar Number of the requested user
* @returns
*/
async approveNewUser(ctx, name, aadharNumber){
  const userKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.users', [name+ '-' +aadharNumber]);
  const approvedUserKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.approvedUsers', [name+ '-' +aadharNumber]);

  let userBuffer = await ctx.stub
  .getState(userKey)
  .catch(err => console.log(err));

  let isExistingUser = await ctx.stub
  .getState(approvedUserKey)
  .catch(err => console.log(err));

  if (userBuffer.length === 0 || isExistingUser !== 0) {
  	throw new Error('Invalid User: ' + name +'. Request doesnt exists or already approved');
  } else {
    let requestUserObject = JSON.parse(userBuffer.toString());
  	let approvedUserObject = {
  		name: requestUserObject["name"],
      email: requestUserObject["email"],
      phoneNumber: requestUserObject["phoneNumber"],
      aadharNumber: requestUserObject["aadharNumber"],
      createdAt: requestUserObject["createdAt"],
      upgradCoins: 0,
  	};
}

  // Convert the JSON object to a buffer and send it to blockchain for storage
  let dataBuffer = Buffer.from(JSON.stringify(approvedUserObject));
  await ctx.stub.putState(approvedUserKey, dataBuffer);
  return approvedUserObject;
}

/**
* This function is used to view approved users with the help of their composite key.
* @param ctx - The transaction context object
* @param name - Name of the requested user
* @param aadharNumber - Aadhar Number of the requested user
* @returns
*/
async viewUser(ctx, name, aadharNumber) {
  const userKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.approvedUsers', [name+ '-' +aadharNumber]);

  let userBuffer = await ctx.stub
      .getState(userKey)
      .catch(err => console.log(err));
  return JSON.parse(userBuffer.toString());
}

/**
* This function is used to register property requests.
* Need some validations like if the property exists in the approved list
* or if it exists in the property list.
* @param ctx - The transaction context object
* @param propertyId - Id of the property
* @returns
*/
async approvePropertyRegistration(ctx, propertyId){
const propertyKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.property', [propertyId]);
const approvedpropertyKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.approvedProperty', [propertyId]);

let propertyBuffer = await ctx.stub
    .getState(propertyKey)
    .catch(err => console.log(err));

let isExistingProperty = await ctx.stub
    .getState(approvedpropertyKey)
    .catch(err => console.log(err));

if (propertyBuffer.length === 0 || isExistingProperty !== 0) {
			throw new Error('Invalid Property: ' + propertyId +'. Request doesnt exists or already approved');
		} else {
      let requestPropertyObject = JSON.parse(propertyBuffer.toString());
			let approvedPropertyObject = {
        propertyId: requestPropertyObject.propertyId,
        owner: requestPropertyObject.owner,
        price: requestPropertyObject.price,
        status: requestPropertyObject.status,
			};
    }

    // Convert the JSON object to a buffer and send it to blockchain for storage
    let dataBuffer = Buffer.from(JSON.stringify(approvedPropertyObject));
		await ctx.stub.putState(approvedPropertyObject, dataBuffer);
		return approvedPropertyObject;
  }

  /**
  * This function is used to view approved properties.
  * @param ctx - The transaction context object
  * @param propertyId - Id of the property
  * @returns
  */
  async viewProperty(ctx, propertyId) {
    const propertyKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.approvedProperty', [propertyId]);

    let propertyBuffer = await ctx.stub
        .getState(propertyKey)
        .catch(err => console.log(err));
    return JSON.parse(propertyBuffer.toString());
  }
}

module.exports = RegnetRegistrarContract;
