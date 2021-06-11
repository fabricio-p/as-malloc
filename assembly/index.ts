import {BLOCK, ROOT} from './metadata';

const root = changetype<ROOT>(0);
root.size = memory.size() - offsetof<ROOT>();
root.firstFree = load<BLOCK>(offsetof<ROOT>());
root.lastFree = root.firstFree;
root.last = <BLOCK>root.lastFree;


// export function malloc(size: usize): usize {}
