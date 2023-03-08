import { CxValue } from '../../../utils/cx/Cx2/CxValue'
import { VisualPropertyName } from '../VisualPropertyName'
import {
  ColorType,
  FontType,
  NodeBorderLineType,
  NodeShapeType,
  VisualPropertyValueType,
  HorizontalAlignType,
  VerticalAlignType,
  VisibilityType,
  EdgeLineType,
  EdgeArrowShapeType,
} from '../VisualPropertyValue'
import {
  DiscreteMappingFunction,
  ContinuousMappingFunction,
  PassthroughMappingFunction,
  VisualProperty,
  VisualStyle,
} from '..'

type CXLabelPositionValueType = 'center' | 'top' | 'bottom' | 'left' | 'right'
export interface CXLabelPositionType {
  HORIZONTAL_ALIGN: CXLabelPositionValueType
  VERTICAL_ALIGN: CXLabelPositionValueType
  HORIZONTAL_ANCHOR: CXLabelPositionValueType
  VERTICAL_ANCHOR: CXLabelPositionValueType
  MARGIN_X: number
  MARGIN_Y: number
  JUSTIFICATION: CXLabelPositionValueType
}

interface CXFontFaceType {
  FONT_FAMILY: 'serif' | 'sans-serif' | 'monospace'
  FONT_STYLE: 'normal' | 'bold'
  FONT_WEIGHT: string
}

export type CXVisualPropertyValue =
  | VisualPropertyValueType
  | CXLabelPositionType
  | CXFontFaceType
  | CXLabelPositionType

export interface CXDiscreteMappingFunction<T> {
  type: 'DISCRETE'
  definition: {
    attribute: string
    map: Array<{
      v: CxValue
      vp: T
    }>
  }
}

export interface CXPassthroughMappingFunction {
  type: 'PASSTHROUGH'
  definition: {
    attribute: string
  }
}

export interface CXContinuousMappingFunction<T> {
  type: 'CONTINUOUS'
  definition: {
    attribute: string
    map: Array<{
      max?: number
      min?: number
      maxVPValue?: T
      minVPValue?: T
      includeMax: boolean
      includeMin: boolean
    }>
  }
}

export type CXVisualMappingFunction<T> =
  | CXDiscreteMappingFunction<T>
  | CXContinuousMappingFunction<T>
  | CXPassthroughMappingFunction

export type CXId = number

export const vpToCX = (
  vpName: VisualPropertyName,
  vpValue: VisualPropertyValueType,
): CXVisualPropertyValue => {
  const defaultNodeLabelPosition: CXLabelPositionType = {
    HORIZONTAL_ALIGN: 'center',
    HORIZONTAL_ANCHOR: 'center',
    JUSTIFICATION: 'center',
    MARGIN_X: 0.0,
    MARGIN_Y: 0.0,
    VERTICAL_ALIGN: 'center',
    VERTICAL_ANCHOR: 'center',
  }

  const defaultFontValue: CXVisualPropertyValue = {
    FONT_FAMILY: 'sans-serif',
    FONT_STYLE: 'normal',
    FONT_WEIGHT: 'normal',
  }

  if (
    vpName === 'nodeLabelVerticalAlign' ||
    vpName === 'nodeLabelHorizontalAlign'
  ) {
    return Object.assign({}, defaultNodeLabelPosition)
  }

  if (vpName === 'nodeLabelFont' || vpName === 'edgeLabelFont') {
    return Object.assign({}, defaultFontValue, { FONT_FAMILY: vpValue })
  }

  return vpValue as CXVisualPropertyValue
}

export const convertPassthroughMappingToCX = (
  vs: VisualStyle,
  vp: VisualProperty<VisualPropertyValueType>,
  mapping: PassthroughMappingFunction,
): CXPassthroughMappingFunction => {
  const { attribute } = mapping

  return {
    type: 'PASSTHROUGH',
    definition: {
      attribute,
    },
  }
}

export const convertDiscreteMappingToCX = (
  vs: VisualStyle,
  vp: VisualProperty<VisualPropertyValueType>,
  mapping: DiscreteMappingFunction,
): CXDiscreteMappingFunction<CXVisualPropertyValue> => {
  const { vpValueMap, attribute } = mapping

  return {
    type: 'DISCRETE',
    definition: {
      attribute,
      map: Array.from(vpValueMap.entries()).map(([value, vpValue]) => ({
        v: value,
        vp: vpToCX(vp.name, vpValue),
      })),
    },
  }
}
export const convertContinuousMappingToCX = (
  vs: VisualStyle,
  vp: VisualProperty<VisualPropertyValueType>,
  mapping: ContinuousMappingFunction,
): CXContinuousMappingFunction<CXVisualPropertyValue> => {
  const { min, max, controlPoints, attribute } = mapping

  const intervals = []

  for (let i = 0; i < controlPoints.length - 1; i++) {
    const curr = controlPoints[i]
    const next = controlPoints[i + 1]

    if (curr != null && next != null) {
      intervals.push({
        min: curr.value as number,
        max: next.value as number,
        minVPValue: vpToCX(vp.name, curr.vpValue),
        maxVPValue: vpToCX(vp.name, next.vpValue),
        includeMin: curr.inclusive ?? true,
        includeMax: next.inclusive ?? true,
      })
    }
  }

  return {
    type: 'CONTINUOUS',
    definition: {
      map: [
        {
          max: min.value as number,
          maxVPValue: vpToCX(vp.name, min.vpValue),
          includeMax: min.inclusive ?? true,
          includeMin: true, // dummy value, not actually used here
        },
        ...intervals,
        {
          min: max.value as number,
          minVPValue: vpToCX(vp.name, max.vpValue),
          includeMin: max.inclusive ?? true,
          includeMax: true, // dummy value, not actually used here
        },
      ],
      attribute,
    },
  }
}

export interface CXVisualPropertyConverter<T> {
  cxVPName: string
  valueConverter: (cxVPValue: CXVisualPropertyValue) => T
}

export const VPColorConverter = (
  cxVPName: string,
): CXVisualPropertyConverter<ColorType> => {
  return {
    cxVPName,
    valueConverter: (cxVPValue: CXVisualPropertyValue): ColorType =>
      cxVPValue as ColorType,
  }
}
export const VPStringConverter = (
  cxVPName: string,
): CXVisualPropertyConverter<string> => {
  return {
    cxVPName,
    valueConverter: (cxVPValue: CXVisualPropertyValue): string =>
      cxVPValue as string,
  }
}

export const VPNumberConverter = (
  cxVPName: string,
): CXVisualPropertyConverter<number> => {
  return {
    cxVPName,
    valueConverter: (cxVPValue: CXVisualPropertyValue): number =>
      cxVPValue as number,
  }
}
export const VPFontTypeConverter = (
  cxVPName: string,
): CXVisualPropertyConverter<FontType> => {
  return {
    cxVPName,
    valueConverter: (cxVPValue: CXFontFaceType): FontType =>
      cxVPValue.FONT_FAMILY as FontType,
  }
}

export const VPNodeBorderLineTypeConverter = (
  cxVPName: string,
): CXVisualPropertyConverter<NodeBorderLineType> => {
  return {
    cxVPName,
    valueConverter: (cxVPValue: CXVisualPropertyValue): NodeBorderLineType =>
      cxVPValue as NodeBorderLineType,
  }
}

export const VPNodeShapeTypeConverter = (
  cxVPName: string,
): CXVisualPropertyConverter<NodeShapeType> => {
  return {
    cxVPName,
    valueConverter: (cxVPValue: CXVisualPropertyValue): NodeShapeType =>
      cxVPValue as NodeShapeType,
  }
}

export const VPNodeLabelHorizonalAlignTypeConverter = (
  cxVPName: string,
): CXVisualPropertyConverter<HorizontalAlignType> => {
  return {
    cxVPName,
    valueConverter: (cxVPValue: CXLabelPositionType): HorizontalAlignType => {
      return 'center' // TODO - implement real conversion
    },
  }
}
export const VPNodeLabelVerticalAlignTypeConverter = (
  cxVPName: string,
): CXVisualPropertyConverter<VerticalAlignType> => {
  return {
    cxVPName,
    valueConverter: (cxVPValue: CXLabelPositionType): VerticalAlignType => {
      return 'center' // TODO - implement real conversion
    },
  }
}

export const VPVisibilityTypeConverter = (
  cxVPName: string,
): CXVisualPropertyConverter<VisibilityType> => {
  return {
    cxVPName,
    valueConverter: (cxVPValue: VisibilityType): VisibilityType => cxVPValue,
  }
}

export const VPEdgeLineTypeConverter = (
  cxVPName: string,
): CXVisualPropertyConverter<EdgeLineType> => {
  return {
    cxVPName,
    valueConverter: (cxVPValue: EdgeLineType): EdgeLineType => cxVPValue,
  }
}

export const VPEdgeArrowShapeTypeConverter = (
  cxVPName: string,
): CXVisualPropertyConverter<EdgeArrowShapeType> => {
  return {
    cxVPName,
    valueConverter: (cxVPValue: EdgeArrowShapeType): EdgeArrowShapeType =>
      cxVPValue,
  }
}
export const VPBooleanConverter = (
  cxVPName: string,
): CXVisualPropertyConverter<boolean> => {
  return {
    cxVPName,
    valueConverter: (cxVPValue: boolean): boolean => cxVPValue,
  }
}

// lookup table of visual style property names to cx property names
export const cxVisualPropertyConverter: Record<
  VisualPropertyName,
  CXVisualPropertyConverter<VisualPropertyValueType>
> = {
  nodeShape: VPNodeShapeTypeConverter('NODE_SHAPE'),
  nodeBorderColor: VPColorConverter('NODE_BORDER_COLOR'),
  nodeBorderLineType: VPColorConverter('NODE_BORDER_STYLE'),
  nodeBorderWidth: VPNumberConverter('NODE_BORDER_WIDTH'),
  nodeBorderOpacity: VPNumberConverter('NODE_BORDER_OPACITY'),
  nodeHeight: VPNumberConverter('NODE_HEIGHT'),
  nodeWidth: VPNumberConverter('NODE_WIDTH'),
  nodeBackgroundColor: VPColorConverter('NODE_BACKGROUND_COLOR'),
  nodeLabel: VPStringConverter('NODE_LABEL'),
  nodeLabelColor: VPColorConverter('NODE_LABEL_COLOR'),
  nodeLabelFontSize: VPNumberConverter('NODE_LABEL_FONT_SIZE'),
  nodeLabelFont: VPFontTypeConverter('NODE_LABEL_FONT_FACE'),
  nodeLabelHorizontalAlign: VPNodeLabelHorizonalAlignTypeConverter(
    'NODE_LABEL_POSITION',
  ),
  nodeLabelVerticalAlign: VPNodeLabelVerticalAlignTypeConverter(
    'NODE_LABEL_POSITION',
  ),
  nodeLabelRotation: VPNumberConverter('NODE_LABEL_ROTATION'),
  nodeLabelOpacity: VPNumberConverter('NODE_LABEL_OPACITY'),
  // nodePositionX: VPNumberConverter('NODE_X_LOCATION'),
  // nodePositionY: VPNumberConverter('NODE_Y_LOCATION'),
  // nodePositionZ: VPNumberConverter('NODE_Z_LOCATION'),
  nodeOpacity: VPNumberConverter('NODE_BACKGROUND_OPACITY'),
  nodeVisibility: VPVisibilityTypeConverter('NODE_VISIBLITY'),

  edgeLineType: VPEdgeLineTypeConverter('EDGE_LINE_STYLE'),
  edgeLineColor: VPColorConverter('EDGE_LINE_COLOR'),
  edgeWidth: VPNumberConverter('EDGE_WIDTH'),
  edgeTargetArrowShape: VPEdgeArrowShapeTypeConverter(
    'EDGE_TARGET_ARROW_SHAPE',
  ),
  edgeSourceArrowShape: VPEdgeArrowShapeTypeConverter(
    'EDGE_SOURCE_ARROW_SHAPE',
  ),
  edgeTargetArrowColor: VPColorConverter('EDGE_TARGET_ARROW_COLOR'),
  edgeSourceArrowColor: VPColorConverter('EDGE_SOURCE_ARROW_COLOR'),
  edgeLabel: VPStringConverter('EDGE_LABEL'),
  edgeLabelColor: VPColorConverter('EDGE_LABEL_COLOR'),
  edgeLabelFontSize: VPNumberConverter('EDGE_LABEL_FONT_SIZE'),
  edgeLabelFont: VPFontTypeConverter('EDGE_LABEL_FONT_FACE'),
  edgeLabelRotation: VPNumberConverter('EDGE_LABEL_ROTATION'),
  // edgeLabelAutoRotation: VPBooleanConverter('EDGE_LABEL_AUTO_ROTATION'),
  edgeLabelOpacity: VPNumberConverter('EDGE_LABEL_OPACITY'),
  edgeOpacity: VPNumberConverter('EDGE_OPACITY'),
  edgeVisibility: VPVisibilityTypeConverter('EDGE_VISIBILITY'),

  networkBackgroundColor: VPColorConverter('NETWORK_BACKGROUND_COLOR'),
}
