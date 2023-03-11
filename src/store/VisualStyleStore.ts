import { IdType } from '../models/IdType'
import {
  VisualPropertyName,
  VisualPropertyValueType,
  VisualStyle,
} from '../models/VisualStyleModel'

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { ValueType, AttributeName } from '../models/TableModel'
import {
  DiscreteMappingFunction,
  MappingFunctionType,
  PassthroughMappingFunction,
  ContinuousMappingFunction,
} from '../models/VisualStyleModel/VisualMappingFunction'
import { ContinuousFunctionControlPoint } from '../models/VisualStyleModel/VisualMappingFunction/ContinuousMappingFunction'
import { VisualPropertyValueTypeName } from '../models/VisualStyleModel/VisualPropertyValueTypeName'

import { deleteVisualStyleFromDb, putVisualStyleToDb } from './persist/db'

/**
//  * Visual Style State manager based on zustand
//  */
interface VisualStyleState {
  visualStyles: Record<IdType, VisualStyle>
}

/**
 * Actions to mutate visual style structure
 */
interface UpdateVisualStyleAction {
  setDefault: (
    networkId: IdType,
    vpName: VisualPropertyName,
    vpValue: VisualPropertyValueType,
  ) => void
  setBypass: (
    networkId: IdType,
    vpName: VisualPropertyName,
    elementIds: IdType[],
    vpValue: VisualPropertyValueType,
  ) => void
  deleteBypass: (
    networkId: IdType,
    vpName: VisualPropertyName,
    elementIds: IdType[],
  ) => void
  setDiscreteMappingValue: (
    networkId: IdType,
    vpName: VisualPropertyName,
    values: ValueType[],
    vpValue: VisualPropertyValueType,
  ) => void
  deleteDiscreteMappingValue: (
    networkId: IdType,
    vpName: VisualPropertyName,
    values: ValueType[],
  ) => void
  setContinuousMappingValues: (
    networkId: IdType,
    vpName: VisualPropertyName,
    min: ContinuousFunctionControlPoint,
    max: ContinuousFunctionControlPoint,
    controlPoints: ContinuousFunctionControlPoint[],
  ) => void
  createContinuousMapping: (
    networkId: IdType,
    vpName: VisualPropertyName,
    vpType: VisualPropertyValueTypeName,
    attribute: AttributeName,
    attributeValues: ValueType[],
  ) => void
  createDiscreteMapping: (
    networkId: IdType,
    vpName: VisualPropertyName,
    attribute: AttributeName,
  ) => void
  createPassthroughMapping: (
    networkId: IdType,
    vpName: VisualPropertyName,
    attribute: AttributeName,
  ) => void
  removeMapping: (networkId: IdType, vpName: VisualPropertyName) => void
  // setMapping: () // TODO
}

interface VisualStyleAction {
  set: (networkId: IdType, visualStyle: VisualStyle) => void
  delete: (networkId: IdType) => void
  deleteAll: () => void
}

export const useVisualStyleStore = create(
  immer<VisualStyleState & VisualStyleAction & UpdateVisualStyleAction>(
    (set) => ({
      visualStyles: {},

      set: (networkId: IdType, visualStyle: VisualStyle) => {
        set((state) => {
          state.visualStyles[networkId] = visualStyle
          void putVisualStyleToDb(networkId, visualStyle).then(() => {})
          return state
        })
      },

      setDefault: (
        networkId: IdType,
        vpName: VisualPropertyName,
        vpValue: VisualPropertyValueType,
      ) => {
        set((state) => {
          state.visualStyles[networkId][vpName].defaultValue = vpValue
          return state
        })
      },

      setBypass: (
        networkId: IdType,
        vpName: VisualPropertyName,
        elementIds: IdType[],
        vpValue: VisualPropertyValueType,
      ) => {
        set((state) => {
          const bypassMap = state.visualStyles[networkId][vpName].bypassMap

          elementIds.forEach((eleId) => {
            bypassMap.set(eleId, vpValue)
          })

          return state
        })
      },
      deleteBypass(networkId, vpName, elementIds: IdType[]) {
        set((state) => {
          const bypassMap = state.visualStyles[networkId][vpName].bypassMap
          elementIds.forEach((eleId) => {
            bypassMap.delete(eleId)
          })

          return state
        })
      },
      setDiscreteMappingValue: (networkId, vpName, values, vpValue) => {
        set((state) => {
          const mapping = state.visualStyles[networkId][vpName]
            .mapping as DiscreteMappingFunction
          if (mapping?.vpValueMap != null) {
            values.forEach((value) => {
              mapping?.vpValueMap.set(value, vpValue)
            })
          }
        })
      },
      deleteDiscreteMappingValue: (networkId, vpName, values) => {
        set((state) => {
          const mapping = state.visualStyles[networkId][vpName]
            .mapping as DiscreteMappingFunction
          if (mapping?.vpValueMap != null) {
            values.forEach((value) => {
              mapping?.vpValueMap.delete(value)
            })
          }
        })
      },
      setContinuousMappingValues: (
        networkId,
        vpName,
        min,
        max,
        controlPoints,
      ) => {
        set((state) => {
          const mapping = state.visualStyles[networkId][vpName]
            .mapping as ContinuousMappingFunction
          if (mapping != null) {
            mapping.min = min
            mapping.max = max
            mapping.controlPoints = controlPoints
          }
        })
      },

      createDiscreteMapping(networkId, vpName, attributeName) {
        set((state) => {
          const { defaultValue } = state.visualStyles[networkId][vpName]
          const vpValueMap = new Map<ValueType, VisualPropertyValueType>()

          const discreteMapping: DiscreteMappingFunction = {
            attribute: attributeName,
            type: MappingFunctionType.Discrete,
            vpValueMap,
            visualPropertyType: '',
            defaultValue,
          }
          state.visualStyles[networkId][vpName].mapping = discreteMapping
        })
      },

      createContinuousMapping(
        networkId,
        vpName,
        vpType,
        attributeName,
        attributeValues,
      ) {
        set((state) => {
          const DEFAULT_COLOR_SCHEME = ['red', 'white', 'blue']
          const DEFAULT_NUMBER_RANGE =
            !vpName.includes('Opacity') && !vpName.includes('opacity')
              ? [1, 100]
              : [0, 1]

          console.log(vpName)

          const createColorMapping = (): {
            min: ContinuousFunctionControlPoint
            max: ContinuousFunctionControlPoint
            ctrlPts: ContinuousFunctionControlPoint[]
          } => {
            const min = {
              value: attributeValues[0],
              vpValue: DEFAULT_COLOR_SCHEME[0],
              inclusive: true,
            }

            const max = {
              value: attributeValues[attributeValues.length - 1],
              vpValue: DEFAULT_COLOR_SCHEME[2],
              inclusive: true,
            }

            const ctrlPts = [
              {
                value: attributeValues[0],
                vpValue: DEFAULT_COLOR_SCHEME[0],
              },
              {
                value: attributeValues[Math.floor(attributeValues.length / 2)], // TODO compute median instead of just the middle value
                vpValue: DEFAULT_COLOR_SCHEME[1],
              },
              {
                value: attributeValues[attributeValues.length - 1],
                vpValue: DEFAULT_COLOR_SCHEME[2],
              },
            ]

            return { min, max, ctrlPts }
          }

          const createNumberMapping = (): {
            min: ContinuousFunctionControlPoint
            max: ContinuousFunctionControlPoint
            ctrlPts: ContinuousFunctionControlPoint[]
          } => {
            const min = {
              value: attributeValues[0],
              vpValue: DEFAULT_NUMBER_RANGE[0],
              inclusive: true,
            }

            const max = {
              value: attributeValues[attributeValues.length - 1],
              vpValue: DEFAULT_NUMBER_RANGE[1],
              inclusive: true,
            }

            const ctrlPts = [
              {
                value: attributeValues[0],
                vpValue: DEFAULT_NUMBER_RANGE[0],
              },
              {
                value: attributeValues[attributeValues.length - 1],
                vpValue: DEFAULT_NUMBER_RANGE[1],
              },
            ]

            return { min, max, ctrlPts }
          }

          const { defaultValue, type } = state.visualStyles[networkId][vpName]
          if (vpType === VisualPropertyValueTypeName.Color) {
            const { min, max, ctrlPts } = createColorMapping()
            const continuousMapping: ContinuousMappingFunction = {
              attribute: attributeName,
              type: MappingFunctionType.Continuous,
              min,
              max,
              controlPoints: ctrlPts,
              visualPropertyType: type,
              defaultValue,
            }
            state.visualStyles[networkId][vpName].mapping = continuousMapping
          } else if (vpType === VisualPropertyValueTypeName.Number) {
            const { min, max, ctrlPts } = createNumberMapping()
            const continuousMapping: ContinuousMappingFunction = {
              attribute: attributeName,
              type: MappingFunctionType.Continuous,
              min,
              max,
              controlPoints: ctrlPts,
              visualPropertyType: type,
              defaultValue,
            }
            state.visualStyles[networkId][vpName].mapping = continuousMapping
          }

          console.error(
            `Could not create continuous mapping function because vpType needs to be a color or number.  Received ${vpType}}`,
          )
        })
      },

      createPassthroughMapping(networkId, vpName, attributeName) {
        set((state) => {
          const { defaultValue, type } = state.visualStyles[networkId][vpName]
          const passthroughMapping: PassthroughMappingFunction = {
            type: MappingFunctionType.Passthrough,
            attribute: attributeName,
            visualPropertyType: type,
            defaultValue,
          }
          state.visualStyles[networkId][vpName].mapping = passthroughMapping
        })
      },
      removeMapping(networkId, vpName) {
        set((state) => {
          const vp = state.visualStyles[networkId][vpName]
          delete vp.mapping
        })
      },
      delete: (networkId) => {
        set((state) => {
          const filtered: Record<string, VisualStyle> = Object.keys(
            state.visualStyles,
          ).reduce<Record<string, VisualStyle>>((acc, key) => {
            if (key !== networkId) {
              acc[key] = state.visualStyles[key]
            }
            return acc
          }, {})
          void deleteVisualStyleFromDb(networkId).then(() => {
            console.log('# deleted visual style from db')
          })
          return {
            ...state,
            visualStyles: filtered,
          }
        })
      },
      deleteAll: () => {
        set((state) => {
          state.visualStyles = {}
        })
      },
    }),
  ),
)
