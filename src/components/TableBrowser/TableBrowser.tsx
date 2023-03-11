import * as React from 'react'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import Card from '@mui/material/Card'
import { Button, MenuItem } from '@mui/material'
import { useLayer } from 'react-laag'

import {
  Table,
  ValueType,
  ValueTypeName,
  AttributeName,
} from '../../models/TableModel'
import { useTableStore } from '../../store/TableStore'
import { useViewModelStore } from '../../store/ViewModelStore'
import { IdType } from '../../models/IdType'

import {
  DataEditor,
  GridCellKind,
  GridCell,
  EditableGridCell,
  Item,
  Rectangle,
} from '@glideapps/glide-data-grid'
import { translateCXEdgeId } from '../../models/NetworkModel/impl/CyNetwork'
import {
  ListOfValueType,
  SingleValueType,
} from '../../models/TableModel/ValueType'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps): React.ReactElement {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  )
}

// serialize lists of different value types into a string to display in the table
// e.g. [1, 2, 3] -> '1, 2, 3'
const serializeValueList = (value: ListOfValueType): string => {
  return value?.map((v) => String(v)).join(', ') ?? ''
}

// deserialize a string into a list of value types
// e.g. '1, 2, 3' -> [1, 2, 3]
const deserializeValueList = (
  type: ValueTypeName,
  value: string,
): ListOfValueType => {
  const deserializeFnMap: Record<ValueTypeName, (value: string) => ValueType> =
    {
      [ValueTypeName.ListString]: (value: string) =>
        value.split(', ') as ValueType,
      [ValueTypeName.ListLong]: (value: string) =>
        value.split(', ').map((v) => +v) as ValueType,
      [ValueTypeName.ListInteger]: (value: string) =>
        value.split(', ').map((v) => +v) as ValueType,
      [ValueTypeName.ListDouble]: (value: string) =>
        value.split(', ').map((v) => +v) as ValueType,
      [ValueTypeName.ListBoolean]: (value: string) =>
        value.split(', ').map((v) => v === 'true') as ValueType,
      [ValueTypeName.Boolean]: (value: string) => value === 'true',
      [ValueTypeName.String]: (value: string) => value,
      [ValueTypeName.Long]: (value: string) => +value,
      [ValueTypeName.Integer]: (value: string) => +value,
      [ValueTypeName.Double]: (value: string) => +value,
    }

  return deserializeFnMap[type](value) as ListOfValueType
}

const getCellKind = (type: ValueTypeName): GridCellKind => {
  const valueTypeName2CellTypeMap: Record<ValueTypeName, GridCellKind> = {
    [ValueTypeName.String]: GridCellKind.Text,
    [ValueTypeName.Long]: GridCellKind.Number,
    [ValueTypeName.Integer]: GridCellKind.Number,
    [ValueTypeName.Double]: GridCellKind.Number,
    [ValueTypeName.Boolean]: GridCellKind.Boolean,
    [ValueTypeName.ListString]: GridCellKind.Text,
    [ValueTypeName.ListLong]: GridCellKind.Text,
    [ValueTypeName.ListInteger]: GridCellKind.Text,
    [ValueTypeName.ListDouble]: GridCellKind.Text,
    [ValueTypeName.ListBoolean]: GridCellKind.Text,
  }
  return valueTypeName2CellTypeMap[type] ?? GridCellKind.Text
}

// convert list of value type to a string to display in the table
// single value types are supported by the table by default
const valueDisplay = (value: ValueType, type: string): SingleValueType => {
  if (isSingleType(type as ValueTypeName) && !Array.isArray(value)) {
    return value as SingleValueType
  }

  if (isListType(type as ValueTypeName)) {
    if (Array.isArray(value)) {
      return serializeValueList(value)
    }
    return value
  }

  return value as SingleValueType
}

const isSingleType = (type: ValueTypeName): boolean => {
  const singleTypes = [
    ValueTypeName.String,
    ValueTypeName.Integer,
    ValueTypeName.Double,
    ValueTypeName.Long,
    ValueTypeName.Boolean,
  ] as string[]

  return singleTypes.includes(type)
}

const isListType = (type: ValueTypeName): boolean => {
  const listTypes = [
    ValueTypeName.ListString,
    ValueTypeName.ListInteger,
    ValueTypeName.ListDouble,
    ValueTypeName.ListLong,
    ValueTypeName.ListBoolean,
  ] as string[]

  return listTypes.includes(type)
}

type SortDirection = 'asc' | 'desc'
interface SortType {
  column: AttributeName | undefined
  direction: SortDirection | undefined
  valueType: ValueTypeName | undefined
}

const compareStrings = (
  a: string,
  b: string,
  sortDirection: SortDirection,
): number =>
  sortDirection === 'asc'
    ? (a ?? '').localeCompare(b)
    : (b ?? '').localeCompare(a)
const compareNumbers = (
  a: number,
  b: number,
  sortDirection: SortDirection,
): number =>
  sortDirection === 'asc'
    ? (a ?? Infinity) - (b ?? -Infinity) // always put undefined values at the bottom of the list
    : (b ?? Infinity) - (a ?? -Infinity)

const compareBooleans = (
  a: boolean,
  b: boolean,
  sortDirection: SortDirection,
): number => compareStrings(String(a ?? ''), String(b ?? ''), sortDirection)

// TODO come up with better idea of what users want when sorting cells which have list values
const compareLists = (
  a: ListOfValueType,
  b: ListOfValueType,
  sortDirection: SortDirection,
): number =>
  compareStrings(serializeValueList(a), serializeValueList(b), sortDirection)

const sortFnToType: Record<
  ValueTypeName,
  (a: ValueType, b: ValueType, sortDirection: SortDirection) => number
> = {
  [ValueTypeName.ListString]: compareLists,
  [ValueTypeName.ListLong]: compareLists,
  [ValueTypeName.ListInteger]: compareLists,
  [ValueTypeName.ListDouble]: compareLists,
  [ValueTypeName.ListBoolean]: compareLists,
  [ValueTypeName.String]: compareStrings,
  [ValueTypeName.Long]: compareNumbers,
  [ValueTypeName.Integer]: compareNumbers,
  [ValueTypeName.Double]: compareNumbers,
  [ValueTypeName.Boolean]: compareBooleans,
}

export default function TableBrowser(props: {
  currentNetworkId: IdType
  height: number // current height of the panel that contains the table browser -- needed to sync to the dataeditor
  width: number // current width of the panel that contains the table browser -- needed to sync to the dataeditor
}): React.ReactElement {
  const [currentTabIndex, setCurrentTabIndex] = React.useState(0)
  const [menu, setMenu] = React.useState<
    | {
        col: number
        bounds: Rectangle
      }
    | undefined
  >(undefined)
  const [showSearch, setShowSearch] = React.useState(false)
  const onSearchClose = React.useCallback(() => setShowSearch(false), [])
  const [sort, setSort] = React.useState<SortType>({
    column: undefined,
    direction: undefined,
    valueType: undefined,
  })

  const isOpen = menu !== undefined

  const networkId = props.currentNetworkId
  const setHovered = useViewModelStore((state) => state.setHovered)
  const setCellValue = useTableStore((state) => state.setValue)
  const tables: Record<IdType, { nodeTable: Table; edgeTable: Table }> =
    useTableStore((state) => state.tables)
  const duplicateColumn = useTableStore((state) => state.duplicateColumn)
  const nodeTable = tables[networkId]?.nodeTable
  const edgeTable = tables[networkId]?.edgeTable
  const currentTable = currentTabIndex === 0 ? nodeTable : edgeTable
  const nodeIds = Array.from(nodeTable?.rows.keys() ?? new Map()).map((v) => +v)
  const edgeIds = Array.from(edgeTable?.rows.keys() ?? new Map()).map(
    (v) => +v.slice(1),
  )
  const maxNodeId = nodeIds.sort((a, b) => b - a)[0]
  const minNodeId = nodeIds.sort((a, b) => a - b)[0]
  const maxEdgeId = edgeIds.sort((a, b) => b - a)[0]
  const minEdgeId = edgeIds.sort((a, b) => a - b)[0]
  const columns = Array.from(currentTable?.columns.entries() ?? new Map()).map(
    ([key, col], index) => ({
      id: key,
      title: `${key}-${col.type}`,
      type: col.type,
      index,
      hasMenu: true,
    }),
  )

  const rows = Array.from((currentTable?.rows ?? new Map()).values())
  if (sort.column != null && sort.direction != null && sort.valueType != null) {
    const sortFn = sortFnToType[sort.valueType]
    rows.sort((a, b) => {
      const aVal = a[sort.column as AttributeName]
      const bVal = b[sort.column as AttributeName]
      return sortFn(aVal, bVal, sort.direction as SortDirection)
    })
  }

  const { layerProps, renderLayer } = useLayer({
    isOpen,
    auto: true,
    placement: 'bottom-end',
    triggerOffset: 2,

    // TODO does not work presumably because of multiple render inefficiencies
    // TODO investigate
    // onOutsideClick: () => {
    //   console.log('outside click')
    //   console.log(menu)

    //   setMenu(undefined)
    // },

    trigger: {
      getBounds: () => {
        const bounds = {
          left: menu?.bounds.x ?? 0,
          top: menu?.bounds.y ?? 0,
          width: menu?.bounds.width ?? 0,
          height: menu?.bounds.height ?? 0,
          right: (menu?.bounds.x ?? 0) + (menu?.bounds.width ?? 0),
          bottom: (menu?.bounds.y ?? 0) + (menu?.bounds.height ?? 0),
        }
        return bounds
      },
    },
  })

  const handleChange = (
    event: React.SyntheticEvent,
    newValue: number,
  ): void => {
    setCurrentTabIndex(newValue)
  }

  const getContent = React.useCallback(
    (cell: Item): GridCell => {
      const [columnIndex, rowIndex] = cell
      const dataRow = rows[rowIndex]
      const column = columns[columnIndex]
      const columnKey = column.id
      const cellValue = dataRow?.[columnKey]

      if (dataRow == null || cellValue == null) {
        return {
          allowOverlay: true,
          readonly: false,
          kind: GridCellKind.Text,
          displayData: 'N/A',
          data: '',
        }
      }

      const cellType = getCellKind(column.type)
      const processedCellValue = valueDisplay(cellValue, column.type)
      if (cellType === GridCellKind.Boolean) {
        return {
          allowOverlay: false,
          kind: cellType,
          readonly: false,
          data: processedCellValue as boolean,
        }
      } else if (cellType === GridCellKind.Number) {
        return {
          allowOverlay: true,
          kind: cellType,
          readonly: false,
          displayData: String(processedCellValue),
          data: processedCellValue as number,
        }
      } else {
        return {
          kind: GridCellKind.Text,
          allowOverlay: true,
          displayData: String(processedCellValue),
          readonly: false,
          data: processedCellValue as string,
        }
      }
    },
    [props.currentNetworkId, currentTable, tables, sort],
  )

  const onItemHovered = React.useCallback(
    (cell: Item) => {
      const rowIndex = cell[1]
      const rowData = rows[rowIndex]
      const cxId = rowData?.cxId
      if (cxId != null) {
        const eleId =
          currentTable === nodeTable
            ? rowData.cxId
            : translateCXEdgeId(`${rowData.cxId as string}`)
        setHovered(props.currentNetworkId, String(eleId))
      }
    },
    [props.currentNetworkId, currentTable, tables],
  )

  const onCellEdited = React.useCallback(
    (cell: Item, newValue: EditableGridCell) => {
      const [columnIndex, rowIndex] = cell
      // const minId = currentTable === nodeTable ? minNodeId : minEdgeId
      // const rowKey =
      //   currentTable === nodeTable
      //     ? +rowIndex + minId
      //     : translateCXEdgeId(`${+rowIndex + minId}`)

      const rowData = rows[rowIndex]
      const rowKey =
        currentTable === nodeTable
          ? +rowData.cxId
          : translateCXEdgeId(`${rowData.cxId as string}`)

      const column = columns[columnIndex]
      const columnKey = column.id
      let data = newValue.data

      if (isListType(column.type)) {
        data = deserializeValueList(column.type, data as string)
      }

      const newDataIsValid = true

      // TODO validate the new data
      if (newDataIsValid) {
        setCellValue(
          props.currentNetworkId,
          currentTable === nodeTable ? 'node' : 'edge',
          `${rowKey}`,
          columnKey,
          data as ValueType,
        )
      } else {
        // dont edit the value or do something else
      }
    },
    [props.currentNetworkId, currentTable, tables, sort],
  )

  const onHeaderMenuClick = React.useCallback(
    (col: number, bounds: Rectangle): void => {
      setMenu({
        bounds,
        col,
      })
    },
    [],
  )

  const onHeaderClicked = React.useCallback((): void => {
    // eslint-disable-next-line no-console
    console.log('Header clicked')
  }, [])
  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#2F80ED',
          height: 28,
        }}
      >
        <Tabs
          value={currentTabIndex}
          onChange={handleChange}
          aria-label="tabs"
          TabIndicatorProps={{ sx: { backgroundColor: 'white' } }}
          sx={{
            fontSize: 10,
            '& button.Mui-selected': { color: 'white' },
            '& button': {
              minHeight: 30,
              height: 30,
              width: 300,
            },
            height: 30,
            minHeight: 30,
          }}
        >
          <Tab label={<Typography variant="caption">Nodes</Typography>} />
          <Tab label={<Typography variant="caption">Edges</Typography>} />
        </Tabs>
        <KeyboardArrowUpIcon sx={{ color: 'white' }} />
      </Box>
      <TabPanel value={currentTabIndex} index={0}>
        <Button onClick={() => setShowSearch(!showSearch)}>
          Toggle Search
        </Button>
        <Box onMouseLeave={() => setHovered(props.currentNetworkId, null)}>
          <DataEditor
            rowMarkers={'both'}
            rowMarkerStartIndex={minNodeId}
            showSearch={showSearch}
            keybindings={{ search: true }}
            getCellsForSelection={true}
            onSearchClose={onSearchClose}
            onHeaderMenuClick={onHeaderMenuClick}
            onHeaderClicked={onHeaderClicked}
            onItemHovered={(e) => onItemHovered(e.location)}
            width={props.width}
            height={props.height}
            getCellContent={getContent}
            onCellEdited={onCellEdited}
            columns={columns}
            rows={maxNodeId - minNodeId}
          />
        </Box>
        {isOpen &&
          renderLayer(
            <Card
              sx={{
                backgroundColor: 'white',
                width: 175,
                zIndex: 100,
              }}
              {...layerProps}
            >
              <MenuItem
                onClick={() => {
                  const col = menu?.col
                  if (col != null) {
                    const column = columns[col]
                    const columnKey = column.id
                    const columnType = column.type

                    setSort({
                      column: columnKey,
                      direction: 'asc',
                      valueType: columnType,
                    })
                  }
                  setMenu(undefined)
                }}
              >
                Sort ascending
              </MenuItem>
              <MenuItem
                onClick={() => {
                  const col = menu?.col
                  if (col != null) {
                    const column = columns[col]
                    const columnKey = column.id
                    const columnType = column.type
                    setSort({
                      column: columnKey,
                      direction: 'desc',
                      valueType: columnType,
                    })
                  }
                  setMenu(undefined)
                }}
              >
                Sort descending
              </MenuItem>
              <MenuItem
                onClick={() => {
                  const col = menu?.col
                  if (col != null) {
                    // duplicateColumn(col)
                    const column = columns[col]
                    const columnKey = column.id
                    duplicateColumn(
                      props.currentNetworkId,
                      currentTable === nodeTable ? 'node' : 'edge',
                      columnKey,
                    )
                  }
                  // duplicateColumn()
                  setMenu(undefined)
                }}
              >
                Duplicate column
              </MenuItem>
            </Card>,
          )}

        {/* )} */}
      </TabPanel>
      <TabPanel value={currentTabIndex} index={1}>
        <Button onClick={() => setShowSearch(!showSearch)}>
          Toggle Search
        </Button>

        <Box onMouseLeave={() => setHovered(props.currentNetworkId, null)}>
          <DataEditor
            rowMarkers={'both'}
            rowMarkerStartIndex={minEdgeId}
            showSearch={showSearch}
            keybindings={{ search: true }}
            getCellsForSelection={true}
            onSearchClose={onSearchClose}
            onHeaderMenuClick={onHeaderMenuClick}
            onHeaderClicked={onHeaderClicked}
            onItemHovered={(e) => onItemHovered(e.location)}
            width={props.width}
            height={props.height}
            getCellContent={getContent}
            onCellEdited={onCellEdited}
            columns={columns}
            rows={maxEdgeId - minEdgeId}
          />
        </Box>
        {isOpen &&
          renderLayer(
            <Card
              sx={{
                backgroundColor: 'white',
                width: 100,
                height: 100,
                zIndex: 10,
              }}
              {...layerProps}
            >
              <MenuItem
                onClick={() => {
                  const col = menu?.col
                  if (col != null) {
                    const column = columns[col]
                    const columnKey = column.id
                    const columnType = column.type
                    setSort({
                      column: columnKey,
                      direction: 'desc',
                      valueType: columnType,
                    })
                  }
                  setMenu(undefined)
                }}
              >
                Sort ascending
              </MenuItem>
              <MenuItem
                onClick={() => {
                  const col = menu?.col
                  if (col != null) {
                    const column = columns[col]
                    const columnKey = column.id
                    const columnType = column.type
                    setSort({
                      column: columnKey,
                      direction: 'desc',
                      valueType: columnType,
                    })
                  }
                  setMenu(undefined)
                }}
              >
                Sort descending
              </MenuItem>
              <MenuItem
                onClick={() => {
                  const col = menu?.col
                  if (col != null) {
                    const column = columns[col]
                    const columnKey = column.id
                    duplicateColumn(
                      props.currentNetworkId,
                      currentTable === nodeTable ? 'node' : 'edge',
                      columnKey,
                    )
                  }
                  setMenu(undefined)
                }}
              >
                Duplicate column
              </MenuItem>
            </Card>,
          )}
      </TabPanel>
    </Box>
  )
}
