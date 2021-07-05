const fs = require("fs");
const loader = require("@assemblyscript/loader");
const memory = new WebAssembly.Memory({ initial: 1 });
const buffer = Buffer.from(memory.buffer);
const funcs = ['initmem', 'malloc', 'findFit', 'betterFit','reorganisePointers'];
const imports = {
	trace: {
		fragmentation: console.log,
		printBlock(offset, id) {
			if(offset == 0)
				return void(console.log("%s() -> BLOCK [null]", funcs[id])) || offset;
			const physicalPrev = buffer.readUint32LE(offset)
			const size = (buffer.readUint32LE(offset + 4) | 1) - 1;
			const free = buffer.readUint32LE(offset + 4) & 1;
			const prev = buffer.readUint32LE(offset + 8);
			const next = buffer.readUint32LE(offset + 12);
			console.log("%s() -> BLOCK [0x%s] {\n  "+
								  "physicalPrev: 0x%s,\n  "+
									"free: %s,\n  "+
									"size: %s,\n  "+
									"prev: 0x%s,\n  "+
									"next: 0x%s\n  }",
									funcs[id],
									offset.toString(16).padStart(8, '0'),
									physicalPrev.toString(16).padStart(8, '0'),
									free ? "true" : "false", size.toString(10),
									prev.toString(16).padStart(8, '0'),
									next.toString(16).padStart(8, '0'));
			return offset;
		}
	},
	env: { memory }
};
const wasmModule = loader.instantiateSync(fs.readFileSync(__dirname + "/build/untouched.wasm"), imports);
module.exports = wasmModule.exports;
