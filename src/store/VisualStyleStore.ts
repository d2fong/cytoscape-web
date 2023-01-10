import { IdType } from '../models/IdType'
import {
  VisualPropertyName,
  VisualPropertyValueType,
  VisualStyle,
} from '../models/VisualStyleModel'

import create from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { ValueType } from '../models/TableModel'
import { DiscreteMappingFunction } from '../models/VisualStyleModel/VisualMappingFunction'

/**
//  * Visual Style State manager based on zustand
//  */
interface VisualStyleState {
  visualStyles: Record<IdType, Record<string, VisualStyle>>
}

/**
 * Actions to mutate visual style structure
 */
interface UpdateVisualStyleAction {
  setDefault: (
    networkId: IdType,
    visualStyleName: string,
    vpName: VisualPropertyName,
    vpValue: VisualPropertyValueType,
  ) => void
  setBypass: (
    networkId: IdType,
    visualStyleName: string,

    vpName: VisualPropertyName,
    elementIds: IdType[],
    vpValue: VisualPropertyValueType,
  ) => void
  deleteBypass: (
    networkId: IdType,
    visualStyleName: string,

    vpName: VisualPropertyName,
    elementIds: IdType[],
  ) => void
  setDiscreteMappingValue: (
    networkId: IdType,
    visualStyleName: string,

    vpName: VisualPropertyName,
    value: ValueType,
    vpValue: VisualPropertyValueType,
  ) => void
  deleteDiscreteMappingValue: (
    networkId: IdType,
    visualStyleName: string,

    vpName: VisualPropertyName,
    value: ValueType,
  ) => void
  // setMapping: () // TODO
}

interface VisualStyleAction {
  set: (
    networkId: IdType,
    visualStyleName: string,
    visualStyle: VisualStyle,
  ) => void
  //   reset: () => void

  //   add: (network: Network) => void
  //   delete: (networkId: IdType) => void
  //   deleteAll: () => void
}

export const useVisualStyleStore = create(
  immer<VisualStyleState & VisualStyleAction & UpdateVisualStyleAction>(
    (set) => ({
      visualStyles: {},

      set: (
        networkId: IdType,
        visualStyleName: string,
        visualStyle: VisualStyle,
      ) => {
        set((state) => {
          const styles = state.visualStyles[networkId]

          if (styles != null) {
            styles[visualStyleName] = visualStyle
          }
          return state
        })
      },

      setDefault: (
        networkId: IdType,
        visualStyleName: string,

        vpName: VisualPropertyName,
        vpValue: VisualPropertyValueType,
      ) => {
        set((state) => {
          state.visualStyles[networkId][visualStyleName][vpName].defaultValue =
            vpValue
          return state
        })
      },

      setBypass: (
        networkId: IdType,
        visualStyleName: string,

        vpName: VisualPropertyName,
        elementIds: IdType[],
        vpValue: VisualPropertyValueType,
      ) => {
        set((state) => {
          const bypassMap =
            state.visualStyles[networkId][visualStyleName][vpName].bypassMap

          elementIds.forEach((eleId) => {
            bypassMap.set(eleId, vpValue)
          })

          return state
        })
      },
      deleteBypass(
        networkId: IdType,
        visualStyleName: string,
        vpName: VisualPropertyName,
        elementIds: IdType[],
      ) {
        set((state) => {
          const bypassMap =
            state.visualStyles[networkId][visualStyleName][vpName].bypassMap
          elementIds.forEach((eleId) => {
            bypassMap.delete(eleId)
          })

          return state
        })
      },
      setDiscreteMappingValue: (
        networkId: IdType,
        visualStyleName: string,
        vpName: VisualPropertyName,
        value: ValueType,
        vpValue: VisualPropertyValueType,
      ) => {
        set((state) => {
          const mapping = state.visualStyles[networkId][visualStyleName][vpName]
            .mapping as DiscreteMappingFunction
          if (mapping?.vpValueMap != null) {
            mapping?.vpValueMap.set(value, vpValue)
          }
        })
      },
      deleteDiscreteMappingValue: (
        networkId: IdType,
        visualStyleName: string,
        vpName: VisualPropertyName,
        value: ValueType,
      ) => {
        set((state) => {
          const mapping = state.visualStyles[networkId][visualStyleName][vpName]
            .mapping as DiscreteMappingFunction
          if (mapping?.vpValueMap != null) {
            mapping?.vpValueMap.delete(value)
          }
        })
      },
    }),
  ),
)
