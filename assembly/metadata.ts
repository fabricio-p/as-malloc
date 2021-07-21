import {printBlock} from './trace';
@unmanaged @final
export class BLOCK {
	parent: BLOCK|null;
	data: usize;
	prev: BLOCK|null;
	next: BLOCK|null;
	@inline
	constructor(ref: usize) {
		return changetype<BLOCK>(ref);
	}
	@inline
	searchFreePrev(): BLOCK|null {
		let current: BLOCK|null = this;
		const first = offsetof<ROOT>();
		while(current != null && current.ref > first) {
			if((<BLOCK>current).free)
				break;
			current = printBlock((<BLOCK>current).parent, 6);
		}
		return printBlock(current != null && current.ref >= first &&
											current.free ? current : null, 6);
	}
	@inline
	searchFreeNext(): BLOCK|null {
		let current: BLOCK|null = this;
		const last = load<usize>(offsetof<ROOT>("last"));
		while(current != null && current.ref < last) {
			if((<BLOCK>current).free)
				break;
			current = printBlock((<BLOCK>current).child, 7);
		}
		return printBlock(current != null && current.ref <= last && current.free ?
											current : null, 7);
	}
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
	get child(): BLOCK|null {
		if(this != new BLOCK(load<usize>(8)))
			return new BLOCK(this.ref + offsetof<BLOCK>() + this.size);
		else
			return null;
	}
}

@unmanaged
export class ROOT {
	firstFree: BLOCK|null;
	lastFree: BLOCK|null;
	last: BLOCK;
	__: i32;
}
