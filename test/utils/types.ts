import { TypedDocumentNode } from '@apollo/client'

export type MockType<T extends TypedDocumentNode> = T extends TypedDocumentNode<
  infer R,
  infer V
>
  ? {
      request: {
        query: T
        variables: V
      }
      result: {
        data: R
      }
    }
  : unknown
