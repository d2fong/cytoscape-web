import { Core } from 'cytoscape'
import { IdType } from '../../../models/IdType'
import { Edge } from '../../../models/NetworkModel'
import { ValueType } from '../../../models/TableModel'
import { EdgeView, NodeView } from '../../../models/ViewModel'
import { VisualPropertyName } from '../../../models/VisualStyleModel'

export interface CyNode {
  group: 'nodes'
  data: Record<VisualPropertyName | IdType, ValueType>
  position: {
    x: number
    y: number
  }
}

export interface CyEdge {
  group: 'edges'
  data: {
    [key: string]: ValueType
  }
}

const getCyNodes = (nodeViews: NodeView[]): CyNode[] =>
  nodeViews.map((nv: NodeView) => {
    const { values } = nv

    const newData: Record<VisualPropertyName | IdType, ValueType> = {}
    newData['id' as IdType] = nv.id
    values.forEach((value: ValueType, key: VisualPropertyName) => {
      newData[key] = value
    })

    return {
      group: 'nodes',
      data: newData,
      position: {
        x: nv.x,
        y: nv.y,
      },
    }
  })

const getCyEdges = (
  edges: Edge[],
  edgeViews: Record<IdType, EdgeView>,
): CyEdge[] =>
  edges.map((edge: Edge): CyEdge => {
    const edgeView: EdgeView = edgeViews[edge.id]
    const { values } = edgeView
    const newData: Record<string, ValueType> = {
      id: edge.id,
      source: edge.s,
      target: edge.t,
    }
    values.forEach((value: ValueType, key: VisualPropertyName) => {
      newData[key] = value
    })
    return {
      group: 'edges',
      data: newData,
    }
  })

export const addObjects = (
  cy: Core,
  nodeViews: NodeView[],
  edges: Edge[],
  edgeViews: Record<IdType, EdgeView>,
): void => {
  cy.add(getCyNodes(nodeViews))
  cy.add(getCyEdges(edges, edgeViews))
}
