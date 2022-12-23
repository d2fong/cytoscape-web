import { IdType } from '../IdType'

export interface NodeView {
  id: IdType // ID of the associated node
  x?: number // X coordinate of the node
  y?: number // Y coordinate of the node
  z?: number // Z coordinate of the node
  selected?: boolean
}