export interface WorkbenchSummaryCard<TKey extends string = string> {
  key: TKey
  label: string
  value: string
  hint: string
  kind: 'filter' | 'info'
  active: boolean
  interactive: boolean
}

export function isWorkbenchSummaryFilterCard<TKey extends string>(item: WorkbenchSummaryCard<TKey>): boolean {
  return item.kind === 'filter'
}

export function createWorkbenchSummaryCardRows<TKey extends string>(
  items: WorkbenchSummaryCard<TKey>[],
): WorkbenchSummaryCard<TKey>[][] {
  const filterCards = items.filter(isWorkbenchSummaryFilterCard)
  const infoCards = items.filter((item) => item.kind === 'info')

  return [filterCards, infoCards].filter((row) => row.length > 0)
}
