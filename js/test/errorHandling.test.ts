import chai, { expect } from 'chai';
import 'mocha';
import * as E from '../src/errorHandling';
import * as sinon from 'sinon';
import chaiPromise from 'chai-as-promised';
import { Either, isLeft, isRight, left, right } from 'fp-ts/lib/Either';
chai.use(chaiPromise);
// Read the ./chapter/error_handling.md

describe('Error handling', () => {
    describe('EAFP vs LBYL', () => {
        it('should return square of 2nd element of list', () => {
            const list = [1, 2];
            expect(E.squareOfSecondElement(list)).to.equal(4);
        });

        it('should return 0 if 2nd element of list is not present', () => {
            const list = [1];
            expect(E.squareOfSecondElement(list)).to.equal(0);
        });

        it('should return correct greetings', () => {
            const user = { name: 'John Watson', email: 'john.w@gmail.com' };
            expect(E.getGreeting(user)).to.equal('Hi John');
            expect(E.getGreeting1(user)).to.equal('Hi John');

            const anotherUser = { email: 'john.w@gmail.com' };
            expect(E.getGreeting(anotherUser)).to.equal('Hi ');
            expect(E.getGreeting1(anotherUser)).to.equal('Hi ');
        });
    });

    describe('Error as values', () => {
        it('Get the quotation', async () => {
            const user = {
                name: 'John Watson',
                email: 'john.w@gmail.com',
                active: true,
                age: 20,
            };
            const getUserDetails = sinon.stub();
            getUserDetails.resolves(user);
            const result = await E.getQuotation1(
                'john.w@gmail.com',
                getUserDetails,
            );
            expect(result).to.equal(500);
        });

        it('returns 0 if user is not found', async () => {
            const getUserDetails = sinon.stub();
            getUserDetails.rejects('Timeout Error');
            const result = await E.getQuotation1(
                'john.w@gmail.com',
                getUserDetails,
            );
            expect(result).to.be.equal(0);
        });

        it('Get the quotation ', async () => {
            const user = {
                name: 'John Watson',
                email: 'john.w@gmail.com',
                active: true,
                age: 20,
            };
            const getUserDetails = sinon.stub();
            getUserDetails.resolves(right(user));
            const result = await E.getQuotation2(
                'john.w@gmail.com',
                getUserDetails,
            );
            expect(result).to.equal(500);
        });

        it('Get the quotation user is not found', async () => {
            const user = {
                name: 'John Watson',
                email: 'john.w@gmail.com',
                active: true,
                age: 20,
            };
            const getUserDetails = sinon.stub();
            getUserDetails.resolves(left('USER-NOT-FOUND'));
            const result = await E.getQuotation2(
                'john.w@gmail.com',
                getUserDetails,
            );
            expect(result).to.equal(0);
        });
    });
});
