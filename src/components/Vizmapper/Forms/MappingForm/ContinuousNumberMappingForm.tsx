import * as React from 'react'
import { debounce } from 'lodash'
import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  Tooltip,
} from '@mui/material'
import { Axis, LineSeries, XYChart } from '@visx/xychart'

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import Delete from '@mui/icons-material/Close'
import { scaleLinear } from 'd3-scale'
import Draggable from 'react-draggable'

import { IdType } from '../../../../models/IdType'
import {
  VisualProperty,
  VisualPropertyValueType,
} from '../../../../models/VisualStyleModel'
import { ContinuousMappingFunction } from '../../../../models/VisualStyleModel/VisualMappingFunction'
// import { ValueType } from '../../../../models/TableModel'

import { VisualPropertyValueForm } from '../VisualPropertyValueForm'
import { useVisualStyleStore } from '../../../../store/VisualStyleStore'
import { ContinuousFunctionControlPoint } from '../../../../models/VisualStyleModel/VisualMappingFunction/ContinuousMappingFunction'
import { Handle } from './Handle'

export function ContinuousNumberMappingForm(props: {
  currentNetworkId: IdType
  visualProperty: VisualProperty<VisualPropertyValueType>
}): React.ReactElement {
  const m: ContinuousMappingFunction | null = props.visualProperty
    ?.mapping as ContinuousMappingFunction

  if (m == null) {
    return <Box></Box>
  }

  const { min, max, controlPoints } = m

  const [minState, setMinState] = React.useState(min)
  const [maxState, setMaxState] = React.useState(max)

  const LINE_CHART_WIDTH = 400
  const LINE_CHART_HEIGHT = 200
  const LINE_CHART_MARGIN = 42
  const LINE_CHART_ELE_ID = 'line-chart'
  const setContinuousMappingValues = useVisualStyleStore(
    (state) => state.setContinuousMappingValues,
  )
  // map values in the continuous mapping range to a pixel position
  const rangePositionToPixelPosition = (
    domain: [number, number],
    range: [number, number],
    rangePosition: number,
  ): number => {
    const rangeToPixel = scaleLinear(domain, range)
    const value = rangeToPixel(rangePosition) ?? 0

    return value
  }

  const pixelPositionToRangePosition = (
    domain: [number, number],
    range: [number, number],
    pixelPosition: number,
  ): number => {
    const pixelToRange = scaleLinear(domain, range)
    const value = pixelToRange(pixelPosition) ?? 0

    return value
  }

  const [handles, setHandles] = React.useState(() => {
    return [...controlPoints]
      .sort((a, b) => (a.value as number) - (b.value as number))
      .map((pt, index) => {
        return {
          ...pt,
          id: index,
          pixelPosition: {
            x: rangePositionToPixelPosition(
              [minState.value as number, maxState.value as number],
              [LINE_CHART_MARGIN, LINE_CHART_WIDTH - LINE_CHART_MARGIN],
              pt.value as number,
            ),
            y: 0,
          },
        }
      })
  })

  const handleIds = new Set(handles.map((h) => h.id))

  const domain = [
    minState.value as number,
    ...handles.map((h) => h.value as number),
    maxState.value as number,
  ]

  const range = [
    minState.vpValue,
    ...handles.map((h) => h.vpValue as number),
    maxState.vpValue,
  ]

  const mapper = scaleLinear(domain, range)

  const updateContinuousMapping = React.useMemo(
    () =>
      debounce(
        (
          min: ContinuousFunctionControlPoint,
          max: ContinuousFunctionControlPoint,
          handles: Handle[],
        ) => {
          setContinuousMappingValues(
            props.currentNetworkId,
            props.visualProperty.name,
            min,
            max,
            handles.map((h) => {
              return {
                value: h.value,
                vpValue: h.vpValue,
              }
            }),
          )
        },
        200,
        { trailing: true },
      ),
    [],
  )

  React.useEffect(() => {
    // if the mapping attribute changegs, recompute the continuous mapping
    // min, max and handles
    const nextMapping = props.visualProperty
      .mapping as ContinuousMappingFunction
    const nextMin = nextMapping.min ?? minState
    const nextMax = nextMapping.max ?? maxState
    const nextControlPoints =
      nextMapping.controlPoints ?? ([] as ContinuousFunctionControlPoint[])

    setMinState(nextMin)
    setMaxState(nextMax)
    setHandles(
      [...nextControlPoints]
        .sort((a, b) => (a.value as number) - (b.value as number))
        .map((pt, index) => {
          return {
            ...pt,
            id: index,
            pixelPosition: {
              x: rangePositionToPixelPosition(
                [minState.value as number, maxState.value as number],
                [0, LINE_CHART_WIDTH],
                pt.value as number,
              ),
              y: 0,
            },
          }
        }),
    )
  }, [props.visualProperty.mapping?.attribute])

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          marginTop: 12,
          justifyContent: 'space-between',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 1,
            m: 1,
          }}
        >
          <VisualPropertyValueForm
            currentValue={minState.vpValue}
            visualProperty={props.visualProperty}
            onValueChange={(newValue) => {
              setMinState({
                ...minState,
                vpValue: newValue,
              })

              updateContinuousMapping(
                {
                  ...minState,
                  vpValue: newValue,
                },
                maxState,
                handles,
              )
            }}
          />
          <Typography variant="body2">Min</Typography>
          <TextField
            sx={{ width: 50 }}
            inputProps={{
              sx: { p: 0.5, fontSize: 14, width: 50 },
              inputMode: 'numeric',
              pattern: '[0-9]*',
              step: 0.1,
            }}
            onChange={(e) => {
              const newMin = Number(e.target.value)
              if (!isNaN(newMin)) {
                setMinState({
                  ...minState,
                  value: newMin,
                })

                const newHandles = handles.map((h) => {
                  return {
                    ...h,
                    value: pixelPositionToRangePosition(
                      [0, LINE_CHART_WIDTH],
                      [newMin, maxState.value as number],
                      h.pixelPosition.x,
                    ),
                  }
                })

                setHandles(newHandles)

                updateContinuousMapping(
                  {
                    ...minState,
                    value: newMin,
                  },
                  maxState,
                  newHandles,
                )
              }
            }}
            value={minState.value}
          />
        </Box>
        <Box sx={{ display: 'flex', position: 'relative' }}>
          <Tooltip title="Click to add new handle" placement="top" followCursor>
            <Box
              id={LINE_CHART_ELE_ID}
              sx={{
                display: 'flex',
                position: 'relative',
                '&:hover': { cursor: 'copy' },
              }}
              onClickCapture={(e) => {
                const gradientPositionX =
                  e.clientX - e.currentTarget.getBoundingClientRect().x
                let newHandleId = 0
                while (handleIds.has(newHandleId)) {
                  newHandleId++
                }
                const newHandleValue = pixelPositionToRangePosition(
                  [0, LINE_CHART_WIDTH],
                  [minState.value as number, maxState.value as number],
                  gradientPositionX,
                )
                const newHandleVpValue = mapper(newHandleValue)
                const newHandlePixelPosition = {
                  x: rangePositionToPixelPosition(
                    [minState.value as number, maxState.value as number],
                    [0, LINE_CHART_WIDTH],
                    newHandleValue,
                  ),
                  y: 0,
                }

                const newHandle = {
                  id: newHandleId,
                  value: newHandleValue,
                  vpValue: newHandleVpValue,
                  pixelPosition: newHandlePixelPosition,
                }
                const newHandles = [...handles, newHandle].sort(
                  (a, b) => (a.value as number) - (b.value as number),
                )
                setHandles(newHandles)
                updateContinuousMapping(min, max, newHandles)
              }}
            >
              <XYChart
                width={LINE_CHART_WIDTH}
                height={LINE_CHART_HEIGHT}
                margin={{
                  left: LINE_CHART_MARGIN,
                  top: LINE_CHART_MARGIN,
                  bottom: LINE_CHART_MARGIN,
                  right: LINE_CHART_MARGIN,
                }}
                xScale={{ type: 'linear' }}
                yScale={{ type: 'linear' }}
              >
                <Axis
                  label={props.visualProperty.displayName}
                  orientation="left"
                  numTicks={4}
                  tickLabelProps={() => ({ dx: -10 })}
                />
                <Axis
                  label={m.attribute}
                  orientation="bottom"
                  numTicks={20}
                  tickLabelProps={() => ({ dy: 10 })}
                />
                <LineSeries
                  stroke="#008561"
                  dataKey="primary_line"
                  data={domain.map((d, index) => [d, range[index]])}
                  xAccessor={(d) => d[0]}
                  yAccessor={(d) => d[1]}
                />
              </XYChart>
            </Box>
          </Tooltip>
          {handles.map((h) => {
            return (
              <Draggable
                key={h.id}
                bounds="parent"
                handle=".handle"
                onDrag={(e, data) => {
                  const newRangePosition = pixelPositionToRangePosition(
                    [LINE_CHART_MARGIN, LINE_CHART_WIDTH - LINE_CHART_MARGIN],
                    [minState.value as number, maxState.value as number],
                    data.x,
                  )

                  const handleIndex = handles.findIndex(
                    (handle) => handle.id === h.id,
                  )
                  if (handleIndex >= 0) {
                    const newHandles = [...handles]
                    newHandles[handleIndex].value = newRangePosition
                    newHandles.sort(
                      (a, b) => (a.value as number) - (b.value as number),
                    )
                    setHandles(newHandles)
                    updateContinuousMapping(minState, maxState, newHandles)
                  }
                }}
                position={{
                  x: rangePositionToPixelPosition(
                    [minState.value as number, maxState.value as number],
                    [LINE_CHART_MARGIN, LINE_CHART_WIDTH - LINE_CHART_MARGIN],
                    h.value as number,
                  ),
                  y: 0,
                }}
              >
                <Box
                  sx={{
                    width: 2,
                    height: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'absolute',
                    zIndex: 1,
                  }}
                >
                  <Paper
                    sx={{
                      p: 1,
                      position: 'relative',
                      top: -100,
                      zIndex: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <IconButton
                      sx={{ position: 'absolute', top: -20, right: -16 }}
                      onClick={() => {
                        const handleIndex = handles.findIndex(
                          (handle) => handle.id === h.id,
                        )
                        if (handleIndex >= 0) {
                          const newHandles = [...handles]
                          newHandles.splice(handleIndex, 1)
                          setHandles(newHandles)
                          updateContinuousMapping(
                            minState,
                            maxState,
                            newHandles,
                          )
                        }
                      }}
                    >
                      <Delete />
                    </IconButton>

                    <VisualPropertyValueForm
                      currentValue={h.vpValue ?? null}
                      visualProperty={props.visualProperty}
                      onValueChange={(newValue) => {
                        const handleIndex = handles.findIndex(
                          (handle) => handle.id === h.id,
                        )
                        if (handleIndex >= 0) {
                          const newHandles = [...handles]
                          newHandles[handleIndex].vpValue = newValue
                          setHandles(newHandles)
                          updateContinuousMapping(
                            minState,
                            maxState,
                            newHandles,
                          )
                        }
                      }}
                    />
                    <TextField
                      sx={{ width: 50, mt: 1 }}
                      inputProps={{
                        sx: { p: 0.5, fontSize: 14, width: 50 },
                        inputMode: 'numeric',
                        pattern: '[0-9]*',
                        step: 0.1,
                      }}
                      onChange={(e) => {
                        const handleIndex = handles.findIndex(
                          (handle) => handle.id === h.id,
                        )
                        if (handleIndex >= 0) {
                          const newHandles = [...handles]
                          const newVal = Number(e.target.value)

                          if (!isNaN(newVal)) {
                            newHandles[handleIndex].value = newVal
                            newHandles[handleIndex].pixelPosition = {
                              x: rangePositionToPixelPosition(
                                [
                                  minState.value as number,
                                  maxState.value as number,
                                ],
                                [0, LINE_CHART_WIDTH],
                                newVal,
                              ),
                              y: 0,
                            }
                            newHandles.sort(
                              (a, b) =>
                                (a.value as number) - (b.value as number),
                            )
                            setHandles(newHandles)
                            updateContinuousMapping(
                              minState,
                              maxState,
                              newHandles,
                            )
                          }
                        }
                      }}
                      value={h.value as number}
                    />
                  </Paper>
                  <IconButton
                    className="handle"
                    size="large"
                    sx={{
                      position: 'relative',
                      top: -120,
                      '&:hover': { cursor: 'col-resize' },
                    }}
                  >
                    <ArrowDropDownIcon sx={{ fontSize: '40px' }} />
                  </IconButton>
                </Box>
              </Draggable>
            )
          })}
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 1,
            m: 1,
          }}
        >
          <VisualPropertyValueForm
            currentValue={maxState.vpValue}
            visualProperty={props.visualProperty}
            onValueChange={(newValue) => {
              setMaxState({
                ...maxState,
                vpValue: newValue,
              })
              updateContinuousMapping(minState, maxState, handles)
            }}
          />
          <Typography variant="body2">Max</Typography>
          <TextField
            sx={{ width: 50 }}
            inputProps={{
              sx: { p: 0.5, fontSize: 14, width: 50 },
              inputMode: 'numeric',
              pattern: '[0-9]*',
              step: 0.1,
            }}
            onChange={(e) => {
              const newMax = Number(e.target.value)
              if (!isNaN(newMax)) {
                setMaxState({
                  ...maxState,
                  value: newMax,
                })

                const newHandles = handles.map((h) => {
                  return {
                    ...h,
                    value: pixelPositionToRangePosition(
                      [0, LINE_CHART_WIDTH],
                      [minState.value as number, newMax],
                      h.pixelPosition.x,
                    ),
                  }
                })

                setHandles(newHandles)
                updateContinuousMapping(minState, maxState, handles)
              }
            }}
            value={maxState.value}
          />
        </Box>
      </Box>
    </Box>
  )
}
