# as-malloc
This library provides a ligtweight implementation of the holy trinity of
dynamic memory allocation: `malloc`, `realloc`, `free`.
## Usage
If you have never heard of the functions above, you probably lived in a cave.
You just import the functions:
```ts
import {malloc, realloc, free} from "as-malloc";
```
Declare some unmanaged class (for easier memory access:
```ts
@unmanaged
class Foo {
	bar: i32;
	baz: f64;
}
```
Allocate the memory for that class:
```ts
const foo = changetype<Foo>(malloc(offsetof<Foo>()));
```
And then do whatever you want with it:
```ts
foo.bar = 35433;
foo.baz = 45.89117345;
```
## Things to remember
 - as-malloc uses only one page of WebAssembly memory (64kB). This may be
   changed on the future versions
 - If you are using any managed runtime, you should compile your program with
   `--memoryBase 65536`.
