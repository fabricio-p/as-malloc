import {malloc, free, realloc} from '..';
import {BLOCK, ROOT} from '../metadata';

describe("as-malloc", () => {
	test("malloc", () => {
		let block: BLOCK;

		let offset = malloc(8);
		block = new BLOCK(offset - offsetof<BLOCK>());

		expect(offset).toStrictEqual(offsetof<ROOT>() + offsetof<BLOCK>());
		expect(block.ref).toStrictEqual(offsetof<ROOT>());
		expect(block.size).toStrictEqual(8);
		expect(block.free).toStrictEqual(false);
		expect(block.next).toStrictEqual(block.child);
		expect(block.data).toStrictEqual(block.size);

		let otherOffset = malloc(9);
		block = new BLOCK(otherOffset - offsetof<BLOCK>());

		expect(otherOffset).toStrictEqual(offset + 8 + offsetof<BLOCK>());
		expect(block.ref).toStrictEqual(offsetof<ROOT>() + offsetof<BLOCK>() + 8);
		expect(block.size).toStrictEqual(16);
		expect(block.free).toStrictEqual(false);
		expect(block.next).toStrictEqual(block.child);
		expect(block.data).toStrictEqual(block.size);

		block = <BLOCK>block.child;

		expect(block.size).toStrictEqual(<usize>memory.size() - block.ref -
																		 offsetof<BLOCK>());
		expect(block.free).toStrictEqual(true);
		expect(block.size & 1).toStrictEqual(0);
		expect(block.data).toStrictEqual(block.size | 1);
	});
});
