module.exports = {
  /**
   * A set of globs passed to the glob package that qualify typescript files for testing.
   */
  include: ["assembly/__tests__/**/*.spec.ts"],
  /**
   * A set of globs passed to the glob package that quality files to be added to each test.
   */
  add: ["assembly/__tests__/**/*.include.ts"],
  /**
   * All the compiler flags needed for this test suite. Make sure that a binary file is output.
   */
  flags: {
    /** To output a wat file, uncomment the following line. */
    // "--textFile": ["output.wat"],
    /** A runtime must be provided here. */
    "--runtime": [], // Acceptable values are: "incremental", "minimal", and "stub"
  },
	"--memoryBase": [0x400],
  /**
   * A set of regexp that will disclude source files from testing.
   */
  disclude: [/node_modules/],
  /**
   * Add your required AssemblyScript imports here.
   */
	imports(memory, createImports, instantiateSync, binary) {
		const buffer = Buffer.from(memory.buffer);
		const funcs = ['initmem', 'malloc', 'findFit', 'betterFit',
			'swapPointers', 'free', 'BLOCK#searchFreePrev',
			'BLOCK#searchFreeNext', 'updateRoot'];
		let instance; // Imports can reference this
		const myImports = {
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
			// put your web assembly imports here, and return the module
		};
		instance = instantiateSync(binary, createImports(myImports));
		return instance;
	},
  /**
   * Add a custom reporter here if you want one. The following example is in typescript.
   *
   * @example
   * import { TestReporter, TestGroup, TestResult, TestContext } from "as-pect";
   *
   * export class CustomReporter extends TestReporter {
   *   // implement each abstract method here
   *   public abstract onStart(suite: TestContext): void;
   *   public abstract onGroupStart(group: TestGroup): void;
   *   public abstract onGroupFinish(group: TestGroup): void;
   *   public abstract onTestStart(group: TestGroup, result: TestResult): void;
   *   public abstract onTestFinish(group: TestGroup, result: TestResult): void;
   *   public abstract onFinish(suite: TestContext): void;
   * }
   */
  // reporter: new CustomReporter(),
  /**
   * Specify if the binary wasm file should be written to the file system.
   */
  outputBinary: false,
};
