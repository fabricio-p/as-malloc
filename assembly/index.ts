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
	next.free = true;
	block.size = size;
	block.next = next;
	next.parent = block;
	if(next.ref < root.last.ref)
		(<BLOCK>next.child).parent = next;
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
	if(block.prev != null)
		(<BLOCK>block.prev).next = next;
}
@inline
function updateRoot(block: BLOCK): void {
	if(root.firstFree == block)
		root.firstFree = printBlock(block.prev || block.next, 8);
	if(root.lastFree == block)
		root.lastFree = block.next;
	if(root.last == block)
		root.last = <BLOCK>block.next;
}
export function malloc(size: usize): usize {
	if(!initialised)
		meminit();
	if(root.firstFree == null)
		return 0;
	size = align(size);
	let fit = findFirstFit(<BLOCK>root.firstFree, size);
	printBlock(fit, 1);
	if(fit == null)
		return 0;
	let block: BLOCK = <BLOCK>fit;
	if(block.size > size)
		trySplit(block, size);
	updateRoot(block);
	block.free = false;
	printBlock(block, 1);
	return block.ref + offsetof<BLOCK>();
}
export function free(offset: usize): void {
	if(offset < offsetof<ROOT>())
		return;
	const block = new BLOCK(offset - offsetof<BLOCK>());
	/*if((*/block.prev = block.searchFreePrev()//) == null) {
		block.next = block.searchFreeNext();
	/*} else
		block.next = (<BLOCK>block.prev).next;*/
	if(root.firstFree != null && (<BLOCK>root.firstFree).ref > block.ref)
		root.firstFree = block;
	else if((<BLOCK>root.lastFree).ref < block.ref)
		root.lastFree = block;
	block.free = true;
	printBlock(block, 5);
	printBlock(block.prev, 5);
	printBlock(block.next, 5);
}
export function realloc(offset: usize, newSize: usize): usize {
	if(offset < offsetof<ROOT>())
		return 0;
	const newOffset = malloc(newSize);
	if(!newOffset)
		return 0;
	memory.copy(newOffset, offset, new BLOCK(offset - offsetof<BLOCK>()).size);
	free(offset);
	return newOffset;
}
