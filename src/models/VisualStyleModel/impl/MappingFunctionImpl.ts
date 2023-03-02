import { ValueTypeName } from '../../TableModel'
import { SingleValueType } from '../../TableModel/ValueType'
import {
  ContinuousMappingFunction,
  MappingFunctionType,
  VisualPropertyValueTypeName,
  DiscreteMappingFunction,
  PassthroughMappingFunction,
} from '..'

import {
  CXContinuousMappingFunction,
  CXDiscreteMappingFunction,
  CXPassthroughMappingFunction,
  CXVisualPropertyValue,
} from './cxVisualPropertyConverter'

const valueType2BaseType: Record<ValueTypeName, SingleValueType | null> = {
  [ValueTypeName.String]: 'string',
  [ValueTypeName.Long]: 'number',
  [ValueTypeName.Integer]: 'number',
  [ValueTypeName.Double]: 'number',
  [ValueTypeName.Boolean]: 'boolean',
  [ValueTypeName.ListBoolean]: null,
  [ValueTypeName.ListLong]: null,
  [ValueTypeName.ListDouble]: null,
  [ValueTypeName.ListInteger]: null,
  [ValueTypeName.ListString]: null,
}

// check whether a given value type can be applied to a given visual property value type
// e.g. number and font size is a valid mapping but number to a string property is not
export const typesCanBeMapped = (
  mappingType: MappingFunctionType,
  valueTypeName: ValueTypeName,
  vpValueTypeName: VisualPropertyValueTypeName,
): boolean => {
  if (mappingType === MappingFunctionType.Passthrough) {
    const vtBaseType = valueType2BaseType[valueTypeName]
    const isSingleValue = vtBaseType != null
    return (
      valueTypeName === vpValueTypeName ||
      (isSingleValue && vpValueTypeName === VisualPropertyValueTypeName.String) // any single value type can be mapped to a string
    )
  }

  if (mappingType === MappingFunctionType.Continuous) {
    const vtIsNumber =
      valueTypeName === ValueTypeName.Integer ||
      valueTypeName === ValueTypeName.Double ||
      valueTypeName === ValueTypeName.Long
    const vpIsNumberOrColor =
      vpValueTypeName === VisualPropertyValueTypeName.Number ||
      vpValueTypeName === VisualPropertyValueTypeName.Color

    return vtIsNumber && vpIsNumberOrColor
  }

  return true
}

export const convertPassthroughMappingToCX = (
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
  mapping: DiscreteMappingFunction,
): CXDiscreteMappingFunction<CXVisualPropertyValue> => {
  const { vpValueMap, attribute } = mapping

  return {
    type: 'DISCRETE',
    definition: {
      attribute,
      map: Array.from(vpValueMap.entries()).map(([value, vpValue]) => ({
        v: value,
        vp: vpValue,
      })),
    },
  }
}
export const convertContinuousMappingToCX = (
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
        minVPValue: curr.vpValue,
        maxVPValue: next.vpValue,
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
          maxVPValue: min.vpValue,
          includeMax: min.inclusive ?? true,
          includeMin: true, // dummy value, not actually used here
        },
        ...intervals,
        {
          min: max.value as number,
          minVPValue: max.vpValue,
          includeMin: max.inclusive ?? true,
          includeMax: true, // dummy value, not actually used here
        },
      ],
      attribute,
    },
  }
}
