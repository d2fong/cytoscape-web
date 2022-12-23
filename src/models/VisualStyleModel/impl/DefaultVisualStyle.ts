import { VisualStyle } from '../VisualStyle'

export const defaultVisualStyle: VisualStyle = {
  nodeShape: {
    group: 'node',
    name: 'nodeShape',
    type: 'nodeShape',
    displayName: 'shape',
    defaultValue: 'ellipse',
    mapping: null,
    bypassMap: new Map(),
  },
  nodeBorderColor: {
    group: 'node',
    name: 'nodeBorderColor',
    displayName: 'border color',
    type: 'color',
    defaultValue: '#000000',
    mapping: null,
    bypassMap: new Map(),
  },
  nodeBorderLineType: {
    group: 'node',
    name: 'nodeBorderLineType',
    displayName: 'border line',
    type: 'nodeBorderLine',
    defaultValue: 'solid',
    mapping: null,
    bypassMap: new Map(),
  },
  nodeBorderWidth: {
    group: 'node',
    name: 'nodeBorderWidth',
    displayName: 'border width',
    type: 'number',
    defaultValue: 1,
    mapping: null,
    bypassMap: new Map(),
  },
  nodeBorderOpacity: {
    group: 'node',
    name: 'nodeBorderOpacity',
    displayName: 'border opacity',
    type: 'number',
    defaultValue: 1.0,
    mapping: null,
    bypassMap: new Map(),
  },
  nodeHeight: {
    group: 'node',
    name: 'nodeHeight',
    displayName: 'height',
    type: 'number',
    defaultValue: 40,
    mapping: null,
    bypassMap: new Map(),
  },
  nodeWidth: {
    group: 'node',
    name: 'nodeWidth',
    displayName: 'width',
    type: 'number',
    defaultValue: 40,
    mapping: null,
    bypassMap: new Map(),
  },
  nodeBackgroundColor: {
    group: 'node',
    name: 'nodeBackgroundColor',
    displayName: 'background color',
    type: 'color',
    defaultValue: '#FFFFFF',
    mapping: null,
    bypassMap: new Map(),
  },
  nodeLabel: {
    group: 'node',
    name: 'nodeLabel',
    displayName: 'label',
    type: 'string',
    defaultValue: '',
    mapping: null,
    bypassMap: new Map(),
  },
  nodeLabelColor: {
    group: 'node',
    name: 'nodeLabelColor',
    displayName: 'label color',
    type: 'color',
    defaultValue: '#000000',
    mapping: null,
    bypassMap: new Map(),
  },
  nodeLabelFontSize: {
    group: 'node',
    name: 'nodeLabelFontSize',
    displayName: 'label font size',
    type: 'number',
    defaultValue: 12,
    mapping: null,
    bypassMap: new Map(),
  },
  nodeLabelFont: {
    group: 'node',
    name: 'nodeLabelFont',
    displayName: 'label font',
    type: 'font',
    defaultValue: 'serif',
    mapping: null,
    bypassMap: new Map(),
  },
  nodeLabelHorizontalAlign: {
    group: 'node',
    name: 'nodeLabelHorizontalAlign',
    displayName: 'label horizontal align',
    type: 'horizontalAlign',
    defaultValue: 'center',
    mapping: null,
    bypassMap: new Map(),
  },
  nodeLabelVerticalAlign: {
    group: 'node',
    name: 'nodeLabelVerticalAlign',
    displayName: 'label vertical align',
    type: 'verticalAlign',
    defaultValue: 'center',
    mapping: null,
    bypassMap: new Map(),
  },
  nodeLabelRotation: {
    group: 'node',
    name: 'nodeLabelRotation',
    displayName: 'label rotation',
    type: 'number',
    defaultValue: 0,
    mapping: null,
    bypassMap: new Map(),
  },
  nodeLabelOpacity: {
    group: 'node',
    name: 'nodeLabelOpacity',
    displayName: 'label opacity',
    type: 'number',
    defaultValue: 1.0,
    mapping: null,
    bypassMap: new Map(),
  },
  nodePositionX: {
    group: 'node',
    name: 'nodePositionX',
    displayName: 'position x',
    type: 'number',
    defaultValue: 0,
    mapping: null,
    bypassMap: new Map(),
  },
  nodePositionY: {
    group: 'node',
    name: 'nodePositionY',
    displayName: 'position y',
    type: 'number',
    defaultValue: 0,
    mapping: null,
    bypassMap: new Map(),
  },
  nodePositionZ: {
    group: 'node',
    name: 'nodePositionZ',
    displayName: 'position z',
    type: 'number',
    defaultValue: 0,
    mapping: null,
    bypassMap: new Map(),
  },
  nodeOpacity: {
    group: 'node',
    name: 'nodeOpacity',
    displayName: 'opacity',
    type: 'number',
    defaultValue: 1.0,
    mapping: null,
    bypassMap: new Map(),
  },
  nodeVisibility: {
    group: 'node',
    name: 'nodeVisibility',
    displayName: 'visibility',
    type: 'visibility',
    defaultValue: 'element',
    mapping: null,
    bypassMap: new Map(),
  },
  edgeLineColor: {
    group: 'edge',
    name: 'edgeLineColor',
    displayName: 'line color',
    type: 'color',
    defaultValue: '#000000',
    mapping: null,
    bypassMap: new Map(),
  },
  edgeLineType: {
    group: 'edge',
    name: 'edgeLineType',
    displayName: 'line type',
    type: 'edgeLine',
    defaultValue: 'solid',
    mapping: null,
    bypassMap: new Map(),
  },
  edgeOpacity: {
    group: 'edge',
    name: 'edgeOpacity',
    displayName: 'opacity',
    type: 'number',
    defaultValue: 1.0,
    mapping: null,
    bypassMap: new Map(),
  },
  edgeSourceArrowColor: {
    group: 'edge',
    name: 'edgeSourceArrowColor',
    displayName: 'source arrow color',
    type: 'color',
    defaultValue: '#000000',
    mapping: null,
    bypassMap: new Map(),
  },
  edgeSourceArrowShape: {
    group: 'edge',
    name: 'edgeSourceArrowShape',
    displayName: 'source arrow shape',
    type: 'edgeArrowShape',
    defaultValue: 'none',
    mapping: null,
    bypassMap: new Map(),
  },
  edgeTargetArrowColor: {
    group: 'edge',
    name: 'edgeTargetArrowColor',
    displayName: 'target arrow color',
    type: 'color',
    defaultValue: '#000000',
    mapping: null,
    bypassMap: new Map(),
  },
  edgeTargetArrowShape: {
    group: 'edge',
    name: 'edgeTargetArrowShape',
    displayName: 'target arrow shape',
    type: 'edgeArrowShape',
    defaultValue: 'none',
    mapping: null,
    bypassMap: new Map(),
  },
  edgeLabel: {
    group: 'edge',
    name: 'edgeLabel',
    displayName: 'label',
    type: 'string',
    defaultValue: '',
    mapping: null,
    bypassMap: new Map(),
  },
  edgeLabelColor: {
    group: 'edge',
    name: 'edgeLabelColor',
    displayName: 'label color',
    type: 'color',
    defaultValue: '#000000',
    mapping: null,
    bypassMap: new Map(),
  },
  edgeLabelFontSize: {
    group: 'edge',
    name: 'edgeLabelFontSize',
    displayName: 'label font size',
    type: 'number',
    defaultValue: 12,
    mapping: null,
    bypassMap: new Map(),
  },
  edgeLabelFont: {
    group: 'edge',
    name: 'edgeLabelFont',
    displayName: 'label font',
    type: 'font',
    defaultValue: 'serif',
    mapping: null,
    bypassMap: new Map(),
  },
  edgeLabelRotation: {
    group: 'edge',
    name: 'edgeLabelRotation',
    displayName: 'label rotation',
    type: 'number',
    defaultValue: 0,
    mapping: null,
    bypassMap: new Map(),
  },
  edgeLabelOpacity: {
    group: 'edge',
    name: 'edgeLabelOpacity',
    displayName: 'label opacity',
    defaultValue: 1.0,
    type: 'number',
    mapping: null,
    bypassMap: new Map(),
  },
  edgeLabelAutoRotation: {
    group: 'edge',
    name: 'edgeLabelAutoRotation',
    displayName: 'label auto rotation',
    defaultValue: true,
    type: 'boolean',
    mapping: null,
    bypassMap: new Map(),
  },
  edgeWidth: {
    group: 'edge',
    name: 'edgeWidth',
    displayName: 'width',
    type: 'number',
    defaultValue: 1,
    mapping: null,
    bypassMap: new Map(),
  },
  edgeVisibility: {
    group: 'edge',
    name: 'edgeVisibility',
    displayName: 'visibility',
    type: 'visibility',
    defaultValue: 'element',
    mapping: null,
    bypassMap: new Map(),
  },
  networkBackgroundColor: {
    group: 'network',
    name: 'networkBackgroundColor',
    type: 'color',
    displayName: 'background color',
    defaultValue: '#FFFFFF',
    mapping: null,
    bypassMap: new Map(),
  },
}