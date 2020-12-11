'use strict';

const {Contract} = require('fabric-contract-api');

class RegnetUsersContract extends Contract {

  constructor() {
		// Provide a custom name to refer to this smart contract
		super('org.property-registration-network.com.regnetusers');
	}

  /**
   * This is a common user defined function initiated during
   * the instantiation of the smart contract
   */
  async instantiateUsers(ctx) {
		console.log('Users Instantiated for Property Registration Smart Contract.');
		console.log(ctx.clientIdentity.getID());
	}

  /**
	 * A user registered on the network initiates a transaction to request
   the registrar to store their details/credentials on the ledger.
	 * @param ctx - The transaction context object
	 * @param name - Name of the requested user
	 * @param email - Email of the requested user
	 * @param phoneNumber - Phone Number of the requested user
   * @param aadharNumber - Aadhar Number of the requested user
   * @param createdAt - creation date and time
	 * @returns
	 */
  async requestNewUser(ctx, name, email, phoneNumber, aadharNumber, createdAt){

    const userKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.users', [name+ '-' +aadharNumber]);
    let newUserObject = {
  			name: name,
  			email: email,
  			phoneNumber: phoneNumber,
  			aadharNumber: aadharNumber,
  			createdAt: new Date(),
  		};

      // Convert the JSON object to a buffer and send it to blockchain for storage
      let dataBuffer = Buffer.from(JSON.stringify(newUserObject));
  		await ctx.stub.putState(userKey, dataBuffer);

      return newUserObject;
  }

  /**
   * This function is used to approve new users upon request.
   * @param ctx - The transaction context object
   * @param name - Name of the requested user
   * @param aadharNumber - Aadhar Number of the requested user
   * @param bankTransactionId - the bank transaction id to update the upgradCoins
   * @returns
   */
  async rechargeAccount (ctx, name, aadharNumber, bankTransactionId){
    const approvedUserKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.approvedUsers', [name+ '-' +aadharNumber]);

    let approvedUserBuffer = await ctx.stub
        .getState(approvedUserKey)
        .catch(err => console.log(err));

    let approvedUserObject = JSON.parse(approvedUserBuffer.toString());

    if(approvedUserBuffer !== 0){
      if(approvedUserObject.upgradCoins === 'upg100' || approvedUserObject.upgradCoins === 'upg500' || approvedUserObject.upgradCoins === 'upg1000'){
        let tmpCoins = 0;
          if(approvedUserObject.upgradCoins === 'upg100'){
            tmpCoins = 100;
          }
          if(approvedUserObject.upgradCoins === 'upg500'){
            tmpCoins = 500;
          }
          if(approvedUserObject.upgradCoins === 'upg1000'){
            tmpCoins = 1000;
          }
        let updatedUserObject = {
          name: approvedUserObject.name,
          email: approvedUserObject.email,
          phoneNumber: approvedUserObject.phoneNumber,
          aadharNumber: approvedUserObject.aadharNumber,
          createdAt: approvedUserObject.createdAt,
          upgradCoins: tmpCoins,
          }
        }
        else {
          throw new Error('Invalid Bank Transaction Id: ' + bankTransactionId +'. Bad Requests');
        }
      }
      else {
        throw new Error('Invalid User: ' + name +'. User doesnt exists or not approved.');
      }

      // Convert the JSON object to a buffer and send it to blockchain for storage
      let dataBuffer = Buffer.from(JSON.stringify(updatedUserObject));
      await ctx.stub.putState(updatedUserObject, dataBuffer);
      return updatedUserObject;
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
* @param ctx - The transaction context object
* @param name - Name of the requested user
* @param email - Email of the requested user
* @param propertyId - Id of the property
* @param owner - the userkey becomes the owner
* @param price - price of the property
* @param status - sale status of the property
* @returns
*/
async propertyRegistrationRequest(ctx, name, email, propertyId, owner, price, status){
const requestedPropertyKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.property', [propertyId]);
const userKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.approvedUsers', [name+ '-' +aadharNumber]);

let propertyRegistrationRequestObject = {
		propertyId: propertyId,
		owner: userKey,
		price: price,
		status: status,
	};

  // Convert the JSON object to a buffer and send it to blockchain for storage
  let dataBuffer = Buffer.from(JSON.stringify(propertyRegistrationRequestObject));
	await ctx.stub.putState(userKey, dataBuffer);

  return propertyRegistrationRequestObject;
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

async updateProperty(ctx, propertyId, name, email, status){
  let msgSender = ctx.clientIdentity.getID();
  const approvedpropertyKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.approvedProperty', [propertyId]);
  const approvedUserKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.approvedUsers', [name+ '-' +aadharNumber]);

  propertyBuffer = await ctx.stub
  .getState(approvedpropertyKey)
  .catch(err => console.log(err));

  let propertyObject = JSON.parse(propertyBuffer.toString());
if(msgSender === propertyObject.owner){
  if(propertyObject.owner === approvedUserKey){
    let updatedPropertyObject = {
      propertyId: propertyObject.propertyId,
      owner: propertyObject.owner,
      price: propertyObject.price,
      status: status,
    };
  }
}
else {
  throw new Error('Invalid user ' + msgSender +'. Only property owner can change status.');
}

	// Convert the JSON object to a buffer and send it to blockchain for storage
  let dataBuffer = Buffer.from(JSON.stringify(updatedPropertyObject));
  await ctx.stub.putState(updatedPropertyObject, dataBuffer);
  return updatedPropertyObject;
  }

  /**
  * This function is used to update the status of the property.
  * It indicates whether the property is onSale or Registered.
  * @param ctx - The transaction context object
  * @param name - Name of the requested user
  * @param aadharNumber - Aadhar Number of the requested user
  * @param propertyId - Id of the property
  * @returns
  */
  async purchaseProperty(ctx, propertyId, name, aadharNumber){
   //creation of composite keys to fetch record from the blockchain
    const approvedpropertyKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.approvedProperty', [propertyId]);
    const approvedUserKey = ctx.stub.createCompositeKey('org.property-registration-network.regnet.approvedUsers', [name+ '-' +aadharNumber]);

    propertyBuffer = await ctx.stub
    .getState(approvedpropertyKey)
    .catch(err => console.log(err));

    approvedUserBuyerBuffer = await ctx.stub
    .getState(approvedUserKey)
    .catch(err => console.log(err));

    let propertyObject = JSON.parse(propertyBuffer.toString());
  		if(propertyObject.status === "Registered")
  			throw new Error('Property : ' + propertyId + ' is not for sale.');

    let buyerObject = JSON.parse(buyerBuffer.toString());
  		if(parseInt(buyerObject.upgradCoins) < parseInt(propertyObject.price))
  			throw new Error('Buyer does not have enough upgrad coins to buy the property');

    let sellerKey = propertyObject.owner;

  		let sellerBuffer = await ctx.stub
  				.getState(sellerKey)
  				.catch(err => console.log(err));

  	let sellerObject = JSON.parse(sellerBuffer.toString());

  //update property object
  	propertyObject.owner = buyerUserKey;
  	propertyObject.status = "Registered" ;
  	let dataBuffer = Buffer.from(JSON.stringify(propertyObject));
  	await ctx.stub.putState(propertyKey, dataBuffer);

  	//update buyer object
  	buyerObject.upgradCoins = parseInt(buyerObject.upgradCoins) - parseInt(propertyObject.price);
  	dataBuffer = Buffer.from(JSON.stringify(buyerObject));
  	await ctx.stub.putState(buyerUserKey, dataBuffer);

   //update seller
  	sellerObject.upgradCoins = parseInt(sellerObject.upgradCoins) + parseInt(propertyObject.price);
  	dataBuffer = Buffer.from(JSON.stringify(sellerObject));
  	await ctx.stub.putState(sellerKey, dataBuffer);

  }
}

module.exports = RegnetUsersContract;
