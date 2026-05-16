export interface WorkbenchSummaryCard {
  key: string
  label: string
  value: string
  hint: string
  kind: 'filter' | 'info'
  active: boolean
  interactive: boolean
}

export function isWorkbenchSummaryFilterCard(item: WorkbenchSummaryCard): boolean {
  return item.kind === 'filter'
}

export function createWorkbenchSummaryCardRows(items: WorkbenchSummaryCard[]): WorkbenchSummaryCard[][] {
  const filterCards = items.filter(isWorkbenchSummaryFilterCard)
  const infoCards = items.filter((item) => item.kind === 'info')

  return [filterCards, infoCards].filter((row) => row.length > 0)
}
