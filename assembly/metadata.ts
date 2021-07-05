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
	get free(): boolean {
		return <boolean>this.data & 1;
	}
	@inline
	set free(free: boolean) {
		this.data = free ? this.data | 1 : this.size;
	}
	@inline
	get size(): usize {
		return (this.data | 1) - 1;
	}
	@inline
	set size(size: usize) {
		this.data = size | <usize>this.free;
	}
	get ref(): usize {
		return changetype<usize>(this);
	}
}

@unmanaged @align(16)
export class ROOT {
	firstFree: BLOCK|null;
	lastFree: BLOCK|null;
	last: BLOCK;
}
