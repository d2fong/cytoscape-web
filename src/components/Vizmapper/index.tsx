import * as React from 'react'
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
} from '@mui/material'
import { SelectChangeEvent } from '@mui/material/Select'

import { IdType } from '../../models/IdType'
import VisualStyleFn, {
  VisualProperty,
  VisualPropertyValueType,
  VisualStyle,
} from '../../models/VisualStyleModel'

import { useVisualStyleStore } from '../../store/VisualStyleStore'

import { MappingForm } from './Forms/MappingForm'
import { BypassForm } from './Forms/BypassForm'
import { DefaultValueForm } from './Forms/DefaultValueForm'

function VisualPropertyView(props: {
  currentNetworkId: IdType
  currentVisualStyleName: string
  visualProperty: VisualProperty<VisualPropertyValueType>
}): React.ReactElement {
  const { visualProperty, currentNetworkId, currentVisualStyleName } = props

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        p: 1,
      }}
    >
      <DefaultValueForm
        sx={{ mr: 1 }}
        visualProperty={visualProperty}
        currentVisualStyleName={currentVisualStyleName}
        currentNetworkId={currentNetworkId}
      />
      <MappingForm
        sx={{ mr: 1 }}
        currentNetworkId={currentNetworkId}
        currentVisualStyleName={currentVisualStyleName}
        visualProperty={visualProperty}
      />
      <BypassForm
        sx={{ mr: 1 }}
        currentNetworkId={currentNetworkId}
        currentVisualStyleName={currentVisualStyleName}
        visualProperty={visualProperty}
      />
      <Box sx={{ ml: 1 }}>{visualProperty.displayName}</Box>
    </Box>
  )
}

export default function VizmapperView(props: {
  currentNetworkId: IdType
}): React.ReactElement {
  const [currentTabIndex, setCurrentTabIndex] = React.useState(0)
  const [selectedVisualStyleIndex, setSelectedVisualStyleIndex] =
    React.useState(0)
  const visualStyles: Record<
    IdType,
    Record<string, VisualStyle>
  > = useVisualStyleStore((state) => state.visualStyles)

  const changeSelectedVisualStyle = (e: SelectChangeEvent): void => {
    setSelectedVisualStyleIndex(+e.target.value as unknown as number)
  }

  const visualStylesList = Object.entries(
    visualStyles[props.currentNetworkId] ?? {},
  )

  const currentVisualStyle = visualStylesList[selectedVisualStyleIndex]

  if (currentVisualStyle == null) {
    return <div></div>
  }

  const [currentVisualStyleName, currentVisualStyleValues] = currentVisualStyle

  const nodeVps = VisualStyleFn.nodeVisualProperties(
    currentVisualStyleValues,
  ).map((vp) => {
    return (
      <VisualPropertyView
        key={vp.name}
        currentVisualStyleName={currentVisualStyleName}
        currentNetworkId={props.currentNetworkId}
        visualProperty={vp}
      />
    )
  })
  const edgeVps = VisualStyleFn.edgeVisualProperties(
    currentVisualStyleValues,
  ).map((vp) => {
    return (
      <VisualPropertyView
        key={vp.name}
        currentVisualStyleName={currentVisualStyleName}
        currentNetworkId={props.currentNetworkId}
        visualProperty={vp}
      />
    )
  })

  const networkVps = VisualStyleFn.networkVisualProperties(
    currentVisualStyleValues,
  ).map((vp) => {
    return (
      <VisualPropertyView
        key={vp.name}
        currentVisualStyleName={currentVisualStyleName}
        currentNetworkId={props.currentNetworkId}
        visualProperty={vp}
      />
    )
  })

  return (
    <Box
      sx={{
        borderBottom: 1,
        overflow: 'scroll',
        height: '100%',
        width: '100%',
      }}
    >
      <FormControl fullWidth>
        <InputLabel id="visual-style-select">Visual Style</InputLabel>

        <Select
          labelId="visual-style-select"
          value={String(selectedVisualStyleIndex)}
          label="Visual Style"
          onChange={changeSelectedVisualStyle}
        >
          {visualStylesList.map(([name, _], index) => {
            return (
              <MenuItem key={index} value={index}>
                {name}
              </MenuItem>
            )
          })}
        </Select>
      </FormControl>
      <Tabs
        value={currentTabIndex}
        TabIndicatorProps={{ sx: { backgroundColor: 'white' } }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          fontSize: 10,
          pb: 0.5,
          backgroundColor: '#2F80ED',
          '& button.Mui-selected': { color: 'white' },
          '& button': {
            minHeight: 30,
            height: 30,
            width: 30,
          },
          height: 38,
          minHeight: 30,
        }}
        onChange={(e, nextTab) => setCurrentTabIndex(nextTab)}
      >
        <Tab label={<Typography variant="caption">Nodes</Typography>} />
        <Tab label={<Typography variant="caption">Edges</Typography>} />
        <Tab label={<Typography variant="caption">Network</Typography>} />
      </Tabs>
      <Box sx={{ display: 'flex', p: 1 }}>
        <Box sx={{ width: 50, textAlign: 'center', mr: 1 }}>Def.</Box>
        <Box sx={{ width: 50, textAlign: 'center', mr: 1 }}>Map.</Box>
        <Box sx={{ width: 50, textAlign: 'center' }}>Byp.</Box>
      </Box>
      <div hidden={currentTabIndex !== 0}>
        {currentTabIndex === 0 && <Box>{nodeVps}</Box>}
      </div>
      <div hidden={currentTabIndex !== 1}>
        {currentTabIndex === 1 && <Box>{edgeVps}</Box>}
      </div>
      <div hidden={currentTabIndex !== 2}>
        {currentTabIndex === 2 && <Box>{networkVps}</Box>}
      </div>
    </Box>
  )
}
