const assert = require("assert");
const myModule = require("..");

module.children[0].parent = undefined;
const a = myModule.malloc(8);
const b = myModule.malloc(8);

assert.equal(a, 16 * 2);
assert.equal(b, a + 8 + 16);
