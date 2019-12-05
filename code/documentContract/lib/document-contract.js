/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class DocumentContract extends Contract {
 
    async documentExists(ctx, documentId) {
        const buffer = await ctx.stub.getState(documentId);
        return (!!buffer && buffer.length > 0);
    }
    //Creates New Document given key: value pair
    //@param Key is the secrete key 
    //@param Value can be any size text 
    async createDocument(ctx, documentId, value) {
        const exists = await this.documentExists(ctx, documentId);
        if (exists) {
            throw new Error(`The document ${documentId} already exists`);
        }
        const asset = { value };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(documentId, buffer);
    }

    //Read document secrete given key 
    //@param: Key 
     
    async readDocument(ctx, documentId) {
        const exists = await this.documentExists(ctx, documentId);
        if (!exists) {
            throw new Error(`The document ${documentId} does not exist`);
        }
        const buffer = await ctx.stub.getState(documentId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }
    //Update document given secrete key 
     //@param: Key 

    async updateDocument(ctx, documentId, newValue) {
        const exists = await this.documentExists(ctx, documentId);
        if (!exists) {
            throw new Error(`The document ${documentId} does not exist`);
        }
        const asset = { value: newValue };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(documentId, buffer);
    }
   //Delete document given secrete key 
     //@param: Key
    async deleteDocument(ctx, documentId) {
        const exists = await this.documentExists(ctx, documentId);
        if (!exists) {
            throw new Error(`The document ${documentId} does not exist`);
        }
        await ctx.stub.deleteState(documentId);
    }

    //Get Document History given Key  
    //@param: Key
  
    async getHistory(ctx, key) {
        let iterator = await ctx.stub.getHistoryForKey(key);
        let result = [];
        let res = await iterator.next();
        while (!res.done) {
          if (res.value) {
            console.info(`found state update with value: ${res.value.value.toString('utf8')}`);
            const obj = JSON.parse(res.value.value.toString('utf8'));
            result.push(obj);
          }
          res = await iterator.next();
        }
        await iterator.close();
        return result;  
        }

        
    
   
  
}

module.exports = DocumentContract;
