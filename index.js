const fs = require("fs");
const loader = require("@assemblyscript/loader");
const memory = new WebAssembly.Memory({ initial: 1 });
const buffer = Buffer.from(memory.buffer);
const funcs = ['initmem', 'malloc', 'findFit', 'betterFit',
							 'swapPointers', 'free', 'BLOCK#searchFreePrev',
							 'BLOCK#searchFreeNext', 'updateRoot'];
const imports = {
	trace: {
		fragmentation: console.log,
		printBlock(offset, id) {
			if(offset == 0)
				return void(console.log("%s() -> BLOCK [null]", funcs[id])) || offset;
			const physicalPrev = buffer.readUint32LE(offset)
			const size = buffer.readUint32LE(offset + 4);
			const free = buffer.readUint32LE(offset + 4) & 1;
			const prev = buffer.readUint32LE(offset + 8);
			const next = buffer.readUint32LE(offset + 12);
			console.log("%s() -> BLOCK [0x%s] {\n  "+
								  "parent: 0x%s,\n  "+
									"free: %s,\n  "+
									"size: %s,\n  "+
									"prev: 0x%s,\n  "+
									"next: 0x%s\n}",
									funcs[id] || "[js]",
									offset.toString(16).padStart(8, '0'),
									physicalPrev.toString(16).padStart(8, '0'),
									free ? "true" : "false",
									(size & 1 ? size - 1 : size).toString(10),
									prev.toString(16).padStart(8, '0'),
									next.toString(16).padStart(8, '0'));
			return offset;
		},
		printRoot(id) {
			console.log("%s() -> ROOT {\n  "+
									"firstFree: 0x%s\n  "+
									"lastFree: 0x%s\n  "+
									"last: 0x%s\n}",
									funcs[id] || "[js]",
									buffer.readUint32LE(0).toString(16).padStart(8, '0'),
									buffer.readUint32LE(4).toString(16).padStart(8, '0'),
									buffer.readUint32LE(8).toString(16).padStart(8, '0'));
		},
		printU32: (number) => console.log(Math.abs(number))
	},
	env: { memory }
};
const wasmModule = loader.instantiateSync(fs.readFileSync(__dirname + "/build/untouched.wasm"), imports);
module.exports = { ...wasmModule.exports, ...imports };
