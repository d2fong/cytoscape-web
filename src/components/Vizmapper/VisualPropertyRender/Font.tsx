import { FontType } from '../../../models/VisualStyleModel/VisualPropertyValue'
import { Box } from '@mui/material'

export function FontPicker(props: {
  currentValue: FontType | null
  onValueChange: (font: FontType) => void
}): React.ReactElement {
  const { onValueChange, currentValue } = props

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
      }}
    >
      {Object.values(FontType).map((font: FontType) => (
        <Box
          sx={{
            color: currentValue === font ? 'blue' : 'black',
            width: 100,
            p: 1,
            '&:hover': { cursor: 'pointer' },
            fontFamily: font,
          }}
          onClick={() => onValueChange(font)}
          key={font}
        >
          {font}
        </Box>
      ))}
    </Box>
  )
}

export function Font(props: { value: FontType }): React.ReactElement {
  return <Box sx={{ fontFamily: props.value }}>{props.value}</Box>
}