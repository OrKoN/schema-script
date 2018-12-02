<h1 align="center">
  schema-script
  <a href="https://www.npmjs.org/package/schema-script"><img src="https://img.shields.io/npm/v/schema-script.svg?style=flat" alt="npm"></a>
</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/OrKoN/schema-script/master/demo.svg?sanitize=true" width="572" alt="newsletter cli demo">
</p>
<p align="center">
  Zero-configuration pre-processor for <strong>generating runtime and static TypeScript/GraphQL types</strong> based on JSON schemas.
</p>

## Features

✍️ **JSON Schema** for defining external interfaces (APIs, database, user input)

🌈 **Generate** static and runtime TypeScript types

📨 **Enjoy** better type safety

## Prerequisites

In your schemas, add a `$comment` attribute and define which outputs should be generated:

```
  "$comment": "+ts +iots +graphql"
```

Note: for `+iots` install [`io-ts`](https://github.com/gcanti/io-ts)(a TypeScript compatible runtime type system for IO decoding/encoding).
Note: `+graphql` is not supported yet.

## Getting Started

```sh
npm i schema-script -g
schema-script <dir-with-schemas>
ss  <dir-with-schemas>
```
## Examples

See [./examples](examples) for some examples of generated types.

## Get Help

Probably `schema-script` is not working as expected for all possible JSON schemas. It needs more testing and your feedback:

[Open an issue](https://github.com/orkon/schema-script/issues)
