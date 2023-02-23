import { useEffect } from 'react'
import { IdType } from '../../../models/IdType'
import { useNetworkStore } from '../../../store/NetworkStore'
import { useNetworkSummaryStore } from '../../../store/NetworkSummaryStore'
import { useViewModelStore } from '../../../store/ViewModelStore'
import { useVisualStyleStore } from '../../../store/VisualStyleStore'
import { useWorkspaceStore } from '../../../store/WorkspaceStore'

/**
 * Based on the changes in the workspace store, this hook will
 * handle cascading changes to the database.
 *
 * Mostly for clean up tasks.
 */
export const useWorkspaceManager = (): void => {
  const deleteNetwork = useNetworkStore((state) => state.delete)
  const deleteSummary = useNetworkSummaryStore((state) => state.delete)
  const deleteView = useViewModelStore((state) => state.delete)
  const deleteVisualStyle = useVisualStyleStore((state) => state.delete)

  const sub = useWorkspaceStore.subscribe(
    (state) => state.workspace.networkIds,
    (ws, lastWs) => {
      const networkIds = ws
      const lastNetworkIds = lastWs
      if (networkIds.length === 0) {
        console.log('Workspace is empty')
      } else if (networkIds.length < lastNetworkIds.length) {
        console.log('Network removed from workspace')
        const removed = lastNetworkIds.filter((id) => !networkIds.includes(id))
        handleDeleteNetwork(removed[0])
      }
    },
  )

  const handleDeleteNetwork = (deleted: IdType): void => {
    deleteNetwork(deleted)
    deleteSummary(deleted)
    deleteView(deleted)
    deleteVisualStyle(deleted)
  }

  useEffect(() => {
    console.info('Workspace Manager is ready===================')
    return () => {
      sub()
    }
  }, [])
}
