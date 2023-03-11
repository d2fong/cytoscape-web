import * as React from 'react'
import { Suspense, useContext, useEffect, useState } from 'react'
import { Allotment } from 'allotment'
import { Box, Tabs, Tab, Typography } from '@mui/material'
import ShareIcon from '@mui/icons-material/Share'
import PaletteIcon from '@mui/icons-material/Palette'
import VizmapperView from '../Vizmapper'

import { Outlet, useNavigate } from 'react-router-dom'

import { getNdexNetwork } from '../../store/useNdexNetwork'
import { useTableStore } from '../../store/TableStore'
import { useVisualStyleStore } from '../../store/VisualStyleStore'
import { useNetworkStore } from '../../store/NetworkStore'
import { useViewModelStore } from '../../store/ViewModelStore'
import { useWorkspaceStore } from '../../store/WorkspaceStore'
import { IdType } from '../../models/IdType'
import { useNetworkSummaryStore } from '../../store/NetworkSummaryStore'
import { NdexNetworkSummary } from '../../models/NetworkSummaryModel'
import { AppConfigContext } from '../../AppConfigContext'
import { Workspace } from '../../models/WorkspaceModel'
import { Summaries as SummaryList } from '../SummaryPanel'
import { putNetworkViewToDb } from '../../store/persist/db'
import { NetworkView } from '../../models/ViewModel'
import { useWorkspaceManager } from '../../store/hooks/useWorkspaceManager'

import { useCredentialStore } from '../../store/CredentialStore'

const NetworkPanel = React.lazy(() => import('../NetworkPanel/NetworkPanel'))
const TableBrowser = React.lazy(() => import('../TableBrowser/TableBrowser'))

const WorkSpaceEditor: React.FC = () => {
  useWorkspaceManager()

  // Server location
  const { ndexBaseUrl } = useContext(AppConfigContext)

  const navigate = useNavigate()

  const getToken: () => Promise<string> = useCredentialStore(
    (state) => state.getToken,
  )

  const credentialInitialized: boolean = useCredentialStore(
    (state) => state.initialized,
  )

  const currentNetworkId: IdType = useWorkspaceStore(
    (state) => state.workspace.currentNetworkId,
  )
  const workspace: Workspace = useWorkspaceStore((state) => state.workspace)
  const setCurrentNetworkId: (id: IdType) => void = useWorkspaceStore(
    (state) => state.setCurrentNetworkId,
  )

  const setNetworkModified: (id: IdType, isModified: boolean) => void =
    useWorkspaceStore((state) => state.setNetworkModified)

  useViewModelStore.subscribe(
    (state) => state.viewModels[currentNetworkId],
    () => {
      const { networkModified } = workspace
      const isModified: boolean | undefined = networkModified[currentNetworkId]
      if (isModified !== undefined && !isModified) {
        setNetworkModified(currentNetworkId, true)
      }
    },
  )

  // Network Summaries
  const summaries: Record<IdType, NdexNetworkSummary> = useNetworkSummaryStore(
    (state) => state.summaries,
  )
  const fetchAllSummaries = useNetworkSummaryStore((state) => state.fetchAll)
  const removeSummary = useNetworkSummaryStore((state) => state.delete)

  const [tableBrowserHeight, setTableBrowserHeight] = useState(0)
  const [tableBrowserWidth, setTableBrowserWidth] = useState(window.innerWidth)
  const [currentTabIndex, setCurrentTabIndex] = useState(0)
  const [allotmentDimensions, setAllotmentDimensions] = useState<
    [number, number]
  >([0, 0])

  const changeTab = (event: React.SyntheticEvent, newValue: number): void => {
    setCurrentTabIndex(newValue)
  }

  const addNewNetwork = useNetworkStore((state) => state.add)

  // Visual Style Store
  const setVisualStyle = useVisualStyleStore((state) => state.set)
  // Table Store
  const setTables = useTableStore((state) => state.setTables)

  const setViewModel = useViewModelStore((state) => state.setViewModel)
  const viewModels: Record<string, NetworkView> = useViewModelStore(
    (state) => state.viewModels,
  )

  const loadNetworkSummaries = async (): Promise<void> => {
    // Check token first
    const currentToken = await getToken()
    await fetchAllSummaries(workspace.networkIds, ndexBaseUrl, currentToken)
  }

  const loadCurrentNetworkById = async (networkId: IdType): Promise<void> => {
    const currentToken = await getToken()
    // No token available. Just load
    const res = await getNdexNetwork(networkId, ndexBaseUrl, currentToken)
    const { network, nodeTable, edgeTable, visualStyle, networkView } = res

    addNewNetwork(network)
    setVisualStyle(networkId, visualStyle)
    setTables(networkId, nodeTable, edgeTable)
    setViewModel(networkId, networkView)
  }

  /**
   * Initializations
   */
  useEffect(() => {
    const windowWidthListener = (): void => {
      setTableBrowserWidth(window.innerWidth)
    }
    window.addEventListener('resize', windowWidthListener)

    return () => {
      window.removeEventListener('resize', windowWidthListener)
    }
  }, [])

  /**
   * Check number of networks in the workspace
   */
  useEffect(() => {
    if (!credentialInitialized) {
      return
    }
    const networkCount: number = workspace.networkIds.length
    const summaryCount: number = Object.keys(summaries).length

    if (networkCount === 0 && summaryCount === 0) {
      return
    }

    // No action required if empty or no change
    if (networkCount === 0) {
      if (summaryCount !== 0) {
        // Remove the last one
        removeSummary(Object.keys(summaries)[0])
      }
      return
    }

    const summaryIds: IdType[] = [...Object.keys(summaries)]

    // Case 1: network removed
    if (networkCount < summaryCount) {
      const toBeRemoved: IdType[] = summaryIds.filter((id) => {
        return !workspace.networkIds.includes(id)
      })
      removeSummary(toBeRemoved[0])
      return
    }

    // Case 2: network added

    // TODO: Load only diffs
    loadNetworkSummaries()
      .then(() => {})
      .catch((err) => console.error(err))
  }, [workspace.networkIds, credentialInitialized])

  /**
   * Swap the current network, can be an expensive operation
   */
  useEffect(() => {
    if (currentNetworkId === '' || currentNetworkId === undefined) {
      // No need to load new network
      return
    }

    // Update the DB first

    const currentNetworkView: NetworkView = viewModels[currentNetworkId]
    if (currentNetworkView === undefined) {
      loadCurrentNetworkById(currentNetworkId)
        .then(() => {
          navigate(`/${workspace.id}/networks/${currentNetworkId}`)
          console.log('Network loaded for', currentNetworkId)
        })
        .catch((err) => console.error('Failed to load a network:', err))
    } else {
      putNetworkViewToDb(currentNetworkId, currentNetworkView)
        .then(() => {
          console.info('* Network view saved to DB')
          loadCurrentNetworkById(currentNetworkId)
            .then(() => {
              navigate(`/${workspace.id}/networks/${currentNetworkId}`)
              console.log('Network loaded for', currentNetworkId)
            })
            .catch((err) => console.error('Failed to load a network:', err))
        })
        .catch((err) => {
          console.error('Failed to save network view to DB:', err)
        })
    }
  }, [currentNetworkId])

  useEffect(() => {
    let curId: IdType = ''
    if (Object.keys(summaries).length !== 0) {
      curId = Object.keys(summaries)[0]
    }
    setCurrentNetworkId(curId)
  }, [summaries])

  // TODO: avoid hardcoding pixel values
  return (
    <Box sx={{ height: 'calc(100vh - 48px)' }}>
      <Allotment
        vertical
        onChange={(sizes: number[]) => {
          // sizes[0] represents the height of the top pane (network list, network renderer, vizmapper)
          // sizes[1] represents the height of the bottom pane (table browser)
          setAllotmentDimensions([sizes[0], sizes[1]])
          setTableBrowserHeight(sizes[1])
        }}
      >
        <Allotment.Pane>
          <Allotment>
            <Allotment.Pane preferredSize="25%">
              <Box
                sx={{
                  height: '100%',
                }}
              >
                <Tabs
                  sx={{ display: 'flex', alignItems: 'center', height: '40px' }}
                  value={currentTabIndex}
                  onChange={changeTab}
                >
                  <Tab
                    icon={<ShareIcon />}
                    iconPosition="start"
                    label={<Typography variant="body2">WORKSPACE</Typography>}
                  />
                  <Tab
                    icon={<PaletteIcon />}
                    iconPosition="start"
                    label={<Typography variant="body2">STYLE</Typography>}
                  />
                </Tabs>
                <div hidden={currentTabIndex !== 0}>
                  {currentTabIndex === 0 && (
                    <Box
                      sx={{
                        overflow: 'scroll',
                        height: allotmentDimensions[0] - 48,
                        // need to set a height to enable scroll in the network list
                        // 48 is the height of the tool bar
                        width: '100%',
                        padding: 0,
                        margin: 0,
                      }}
                    >
                      <SummaryList summaries={summaries} />
                    </Box>
                  )}
                </div>
                <div hidden={currentTabIndex !== 1}>
                  {currentTabIndex === 1 && (
                    <Box>
                      {' '}
                      <VizmapperView
                        currentNetworkId={currentNetworkId}
                        height={allotmentDimensions[0]}
                      />
                    </Box>
                  )}
                </div>
              </Box>
            </Allotment.Pane>
            <Allotment.Pane>
              <Outlet />
              <NetworkPanel />
            </Allotment.Pane>
          </Allotment>
        </Allotment.Pane>
        <Allotment.Pane minSize={28} preferredSize={150}>
          <Suspense
            fallback={<div>{`Loading from NDEx`}</div>}
            key={currentNetworkId}
          >
            <TableBrowser
              height={tableBrowserHeight}
              width={tableBrowserWidth}
              currentNetworkId={currentNetworkId}
            />
          </Suspense>
        </Allotment.Pane>
      </Allotment>
    </Box>
  )
}

export default WorkSpaceEditor
