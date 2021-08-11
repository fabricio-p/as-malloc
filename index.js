const fs = require("fs");
const loader = require("@assemblyscript/loader");
const funcs = ['initmem', 'malloc', 'findFit', 'betterFit',
							 'swapPointers', 'free', 'BLOCK#searchFreePrev',
							 'BLOCK#searchFreeNext', 'updateRoot'];
const imports = (memory) => {
	const obj = {
		buffer: Buffer.from(memory.buffer),
		trace: {
			fragmentation: console.log,
			printBlock(offset, id) {
				if(offset == 0)
					return void(console.log("%s() -> BLOCK [null]", funcs[id])) || offset;
				const physicalPrev = obj.buffer.readUint32LE(offset)
				const size = obj.buffer.readUint32LE(offset + 4);
				const free = obj.buffer.readUint32LE(offset + 4) & 1;
				const prev = obj.buffer.readUint32LE(offset + 8);
				const next = obj.buffer.readUint32LE(offset + 12);
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
					obj.buffer.readUint32LE(0).toString(16).padStart(8, '0'),
					obj.buffer.readUint32LE(4).toString(16).padStart(8, '0'),
					obj.buffer.readUint32LE(8).toString(16).padStart(8, '0'));
			},
			printU32: (number) => console.log(Math.abs(number))
		},
		env: { memory }
	};
	return obj;
}
if(!module.parent || module.parent.path.includes("test")) {
	const	memory = new WebAssembly.Memory({ initial: 1 });
	const wasmModule = loader.instantiateSync(fs.readFileSync(__dirname + "/build/untouched.wasm"), imports(memory));
	const wasmImports = imports(memory);
	module.exports = { ...wasmModule.exports, ...wasmImports };
}
else
	module.exports = imports;
