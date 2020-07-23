import { expect } from 'chai';
import 'mocha';
import { hello } from '../src/hello';

describe('hello Function', () => {
    it('should return hello world', async () => {
        const result = hello();
        expect(result).to.equal('Hello World!');
    });
});
