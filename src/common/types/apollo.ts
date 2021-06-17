import { MutationTuple, TypedDocumentNode } from '@apollo/client'

// ANCHOR Type mutations results according to types specified in a typed query
export type MutationFromQuery<T extends TypedDocumentNode> =
  T extends TypedDocumentNode<infer R, infer V> ? MutationTuple<R, V> : unknown
