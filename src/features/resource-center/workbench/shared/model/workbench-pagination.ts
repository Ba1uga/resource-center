export type WorkbenchPaginationItem = number | 'ellipsis'

export interface BuildWorkbenchPaginationItemsOptions {
  page: number
  pageCount: number
}

export function buildWorkbenchPaginationItems(
  options: BuildWorkbenchPaginationItemsOptions,
): WorkbenchPaginationItem[] {
  const pageCount = Math.max(1, Math.trunc(options.pageCount))
  const page = Math.min(pageCount, Math.max(1, Math.trunc(options.page)))

  if (pageCount <= 7) {
    return createRange(1, pageCount)
  }

  if (page <= 4) {
    return [...createRange(1, 5), 'ellipsis', pageCount]
  }

  if (page >= pageCount - 3) {
    return [1, 'ellipsis', ...createRange(pageCount - 4, pageCount)]
  }

  return [1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', pageCount]
}

function createRange(start: number, end: number) {
  const safeStart = Math.min(start, end)
  const length = end - safeStart + 1

  return Array.from({ length }, (_, index) => safeStart + index)
}
