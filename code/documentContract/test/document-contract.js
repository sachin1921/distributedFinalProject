/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { DocumentContract } = require('..');
const winston = require('winston');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext {

    constructor() {
        this.stub = sinon.createStubInstance(ChaincodeStub);
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.logging = {
            getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
            setLevel: sinon.stub(),
        };
    }

}

describe('DocumentContract', () => {

    let contract;
    let ctx;

    beforeEach(() => {
        contract = new DocumentContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"document 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"document 1002 value"}'));
    });

    describe('#documentExists', () => {

        it('should return true for a document', async () => {
            await contract.documentExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a document that does not exist', async () => {
            await contract.documentExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createDocument', () => {

        it('should create a document', async () => {
            await contract.createDocument(ctx, '1003', 'document 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"document 1003 value"}'));
        });

        it('should throw an error for a document that already exists', async () => {
            await contract.createDocument(ctx, '1001', 'myvalue').should.be.rejectedWith(/The document 1001 already exists/);
        });

    });

    describe('#readDocument', () => {

        it('should return a document', async () => {
            await contract.readDocument(ctx, '1001').should.eventually.deep.equal({ value: 'document 1001 value' });
        });

        it('should throw an error for a document that does not exist', async () => {
            await contract.readDocument(ctx, '1003').should.be.rejectedWith(/The document 1003 does not exist/);
        });

    });

    describe('#updateDocument', () => {

        it('should update a document', async () => {
            await contract.updateDocument(ctx, '1001', 'document 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"document 1001 new value"}'));
        });

        it('should throw an error for a document that does not exist', async () => {
            await contract.updateDocument(ctx, '1003', 'document 1003 new value').should.be.rejectedWith(/The document 1003 does not exist/);
        });

    });

    describe('#deleteDocument', () => {

        it('should delete a document', async () => {
            await contract.deleteDocument(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a document that does not exist', async () => {
            await contract.deleteDocument(ctx, '1003').should.be.rejectedWith(/The document 1003 does not exist/);
        });

    });

});