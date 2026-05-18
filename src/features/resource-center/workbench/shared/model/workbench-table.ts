export type WorkbenchDensity = 'comfortable' | 'compact'

export type WorkbenchMobileMode = 'auto' | 'table' | 'cards'

export type WorkbenchSelectionMode = 'page-only'

export interface WorkbenchTableEmptyState {
  title: string
  description?: string
}

export interface WorkbenchTableColumn<Row> {
  key: string
  title: string
  width?: string
  align?: 'left' | 'center' | 'right'
  mobileLabel?: string
  hideOnMobile?: boolean
  headerClassName?: string
  cellClassName?: string | ((row: Row) => string | undefined)
}
