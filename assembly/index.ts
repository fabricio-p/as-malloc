import {BLOCK, ROOT} from './metadata';
import {printBlock} from './trace';

var initialised = false;
@global @inline const alignment: usize = 8;
@inline const minBlockSize = offsetof<BLOCK>() + alignment;
const root: ROOT = changetype<ROOT>(0);

function meminit(): void {
	root.firstFree = new BLOCK(offsetof<ROOT>());
	root.lastFree = root.firstFree;
	root.last = <BLOCK>root.lastFree;
	root.last.data = <usize>(<usize>memory.size() - <usize>root.last.ref -
													<usize>offsetof<BLOCK>()) | 1;
	root.last.parent = root.last.next = root.last.prev = null;
	printBlock(root.last, 0);
	initialised = true;
}
@inline
function align(size: usize): usize {
	return (size + alignment - 1) & ~(alignment - 1);
}
@inline
function findFirstFit(start: BLOCK, size: usize): BLOCK|null {
	let current: BLOCK|null = start;
	while(current != null && (<BLOCK>current).size < size)
		current = (<BLOCK>current).next;
	return current;
}
function split(block: BLOCK, size: usize): void {
	const next = new BLOCK(block.ref + offsetof<BLOCK>() + size);
	next.size = block.size - size - offsetof<BLOCK>();
	block.size = size;
	block.next = next;
	swapPointers(block);
}
@inline
function swapPointers(block: BLOCK): void {
	const next = <BLOCK>block.next;
	next.parent = block;
	next.prev = block.prev;
	block.prev = next;
	next.prev = block.prev;
	if (block.prev != null)
		(<BLOCK>block.prev).next = next;
	if (root.firstFree == block)
		root.firstFree = next;
	if (root.lastFree == block)
		root.lastFree = next;
	if (root.last == block)
		root.last = next;
}
export function malloc(size: usize): usize {
	if (!initialised)
		meminit();
	if (root.firstFree == null)
		return 0;
	size = align(size);
	let fit = findFirstFit(<BLOCK>root.firstFree, size);
	printBlock(fit, 1);
	if (fit == null)
		return 0;
	let block: BLOCK = <BLOCK>fit;
	if (block.size > size)
		split(block, size);
	block.free = false;
	return block.ref + offsetof<BLOCK>();
}
