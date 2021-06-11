@unmanaged
export class BLOCK {
	physicalPrev: BLOCK|null;
	data: usize;
	prev: BLOCK|null;
	next: BLOCK|null;
}

@unmanaged
export class ROOT {
	size: usize;
	firstFree: BLOCK|null;
	lastFree: BLOCK|null;
	last: BLOCK;
}
