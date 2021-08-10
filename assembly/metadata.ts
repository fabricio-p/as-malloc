import {printBlock} from './trace';
@unmanaged @final
export class BLOCK {
	parent: BLOCK = BLOCK.null;
	data: usize;
	prev: BLOCK = BLOCK.null;
	next: BLOCK = BLOCK.null;
	// @inline
	static readonly null: BLOCK = changetype<BLOCK>(0);
	@inline
	constructor(ref: usize) {
		return changetype<BLOCK>(ref);
	}
	@inline
	searchFreePrev(): BLOCK {
		let current: BLOCK = this;
		const first = offsetof<ROOT>();
		while(current.ref && current.ref > first) {
			if(current.free)
				break;
			current = printBlock(current.parent, 6);
		}
		return printBlock(current.ref && current.ref >= first &&
											current.free ? current : BLOCK.null, 6);
	}
	@inline
	searchFreeNext(): BLOCK {
		let current: BLOCK = this;
		const last = load<usize>(offsetof<ROOT>("last"));
		while(current.ref && current.ref < last) {
			if(current.free)
				break;
			current = printBlock(current.child, 7);
		}
		return printBlock(current.ref && current.ref <= last && current.free ?
											current : BLOCK.null, 7);
	}
	@inline
	joinNext(requiredSise: usize): boolean {
		if(this.size + offsetof<BLOCK>() +
			 child.size < requiredSise)
			return false;
		if(this.child.next.ref) {
			this.child.next.prev = this;
			this.next = this.child.next;
		}
		if(this.child.child)
			this.child.child.parent = this;
		const root = changetype<ROOT>(0);
		if(root.lastFree == child)
			root.lastFree = this;
		if(root.last == child)
			root.last = this;
		this.size += offsetof<BLOCK>() + child.size;
	}
	@inline
	tryMerge(): boolean {}
	@inline
	get free(): boolean {
		return <boolean>this.data & 1;
	}
	@inline
	set free(free: boolean) {
		this.data = free ? this.data | 1 : this.size;
	}
	@inline
	get size(): usize {
		return this.data & ~1;
	}
	@inline
	set size(size: usize) {
		this.data = size | <usize>this.free;
	}
	@inline
	get ref(): usize {
		return changetype<usize>(this);
	}
	@inline
	get child(): BLOCK {
		if(this != new BLOCK(load<usize>(8)))
			return new BLOCK(this.ref + offsetof<BLOCK>() + this.size);
		else
			return BLOCK.null;
	}
}

@unmanaged
export class ROOT {
	firstFree: BLOCK;
	lastFree:	 BLOCK;
	last:			 BLOCK;
	__padding: i32;
}
