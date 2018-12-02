// auto-generated by json-schema-preprocessor. DO NOT MODIFY BY HAND.

import * as t from "io-ts";

export interface Veggie {
  veggieName: string;
  veggieLike: boolean;
}
export interface Arrays {
  fruits?: Array<string>;
  vegetables?: Array<Veggie>;
}

export const tVeggie = t.interface({
  veggieName: t.string,
  veggieLike: t.boolean,
});

export const tArrays = t.partial({
  fruits: t.array(t.string),
  vegetables: t.array(tVeggie),
});