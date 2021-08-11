import {BLOCK, ROOT} from './metadata';
import {printBlock} from './trace';

var initialised = false;
@global @inline const alignment: usize = 8;
@inline const minBlockSize = offsetof<BLOCK>() + alignment;
const root: ROOT = changetype<ROOT>(0);

function meminit(): void {
	root.firstFree = new BLOCK(offsetof<ROOT>());
	root.lastFree = root.firstFree;
	root.last = root.lastFree;
	root.last.data = <usize>(<usize>memory.size() - <usize>root.last.ref -
													 <usize>offsetof<BLOCK>()) | 1;
	root.last.parent = root.last.next = root.last.prev = BLOCK.null;
	if(ASC_DEBUG) printBlock(root.firstFree, 0);
	initialised = true;
}
@inline
function align(size: usize): usize {
	return (size + alignment - 1) & ~(alignment - 1);
}
@inline
function findFirstFit(start: BLOCK, size: usize): BLOCK {
	let current: BLOCK = start;
	while(current.ref && current.size < size)
		current = current.next;
	return current;
}
function split(block: BLOCK, size: usize): void {
	const child = new BLOCK(block.ref + offsetof<BLOCK>() + size);
	child.size = block.size - size - offsetof<BLOCK>();
	// next.free = true;
	block.size = size;
	block.next = child;
	block.parent = block;
	child.free = true;
	if(child.ref < root.last.ref)
		child.child.parent = child;
	swapPointers(block);
}
function trySplit(block: BLOCK, size: usize): boolean {
	if(block.size - offsetof<BLOCK>() - size - alignment >= alignment) {
		split(block, size);
		return true;
	}
	else
		return false;
}
@inline
function swapPointers(block: BLOCK): void {
	const next = <BLOCK>block.next;
	next.prev = block.prev;
	block.prev = next;
	next.prev = block.prev;
	if(block.prev.ref)
		block.prev.next = next;
}
@inline
function updateRoot(block: BLOCK): void {
	if(root.firstFree == block) {
		root.firstFree = block.prev || block.next;
		if(ASC_DEBUG)
			printBlock(root.firstFree, 8);
	}
	if(root.lastFree == block)
		root.lastFree = block.next;
	if(root.last == block)
		root.last = block.next;
}
export function malloc(size: usize): usize {
	if(!initialised)
		meminit();
	if(!root.firstFree.ref)
		return 0;
	size = align(size);
	let fit = findFirstFit(root.firstFree, size);
	if(ASC_DEBUG) printBlock(fit, 1);
	if(!fit.ref)
		return 0;
	let block: BLOCK = <BLOCK>fit;
	if(block.size > size)
		trySplit(block, size);
	updateRoot(block);
	block.free = false;
	if(ASC_DEBUG) printBlock(block, 1);
	return block.ref + offsetof<BLOCK>();
}
export function free(offset: usize): void {
	if(offset < offsetof<ROOT>())
		return;
	const block = new BLOCK(offset - offsetof<BLOCK>());
	if((block.prev = block.searchFreePrev()).ref) {
		block.next = block.prev.next;
	} else
		block.next = block.searchFreeNext();
	if(root.firstFree.ref && root.firstFree.ref > block.ref)
		root.firstFree = block;
	else if(root.lastFree.ref < block.ref)
		root.lastFree = block;
	block.free = true;
	if(ASC_DEBUG) printBlock(block, 5);
	if(ASC_DEBUG) printBlock(block.prev, 5);
	if(ASC_DEBUG) printBlock(block.next, 5);
}
export function realloc(offset: usize, newSize: usize): usize {
	if(offset <= offsetof<ROOT>())
		return 0;
	const block = new BLOCK(offset - offsetof<BLOCK>());
	if(block.size >= newSize)
		return offset;
	const newOffset = malloc(newSize);
	memory.copy(newOffset, offset, block.size);
	free(offset);
	return newOffset;
}
