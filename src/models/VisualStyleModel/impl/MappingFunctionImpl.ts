import { ValueTypeName } from '../../TableModel'
import { SingleValueType } from '../../TableModel/ValueType'
import { MappingFunctionType, VisualPropertyValueTypeName } from '..'

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
