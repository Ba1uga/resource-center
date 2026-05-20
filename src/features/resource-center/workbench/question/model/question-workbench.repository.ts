import {
  getQuestionChapterLabel,
  getQuestionSubjectLabel,
  questionWorkbenchSeedRecords,
} from './question-workbench.fixtures.ts'

import type {
  QuestionDeleteResult,
  QuestionListResult,
  QuestionMutationInput,
  QuestionQueryState,
  QuestionRecord,
} from './question-workbench.types.ts'

interface QuestionWorkbenchRepository {
  listQuestions(query: QuestionQueryState): QuestionListResult
  createQuestion(input: QuestionMutationInput): QuestionRecord
  updateQuestion(id: string, input: QuestionMutationInput): QuestionRecord
  deleteQuestion(id: string): QuestionDeleteResult
}

interface CreateQuestionWorkbenchRepositoryOptions {
  seed?: QuestionRecord[]
  now?: () => string
  createId?: () => string
}

export function createQuestionWorkbenchRepository(
  options: CreateQuestionWorkbenchRepositoryOptions = {},
): QuestionWorkbenchRepository {
  let records = (options.seed ?? questionWorkbenchSeedRecords).map((record) => cloneQuestionRecord(record))
  const now = options.now ?? (() => new Date().toISOString())
  const createId = options.createId ?? createQuestionIdFactory(records)

  return {
    listQuestions(query) {
      const filteredRecords = records
        .filter((record) => matchesQuestionQuery(record, query))
        .sort((left, right) => compareByUpdatedAt(left.updatedAt, right.updatedAt, query.sortOrder))

      const start = (query.page - 1) * query.pageSize
      const pagedRecords = filteredRecords
        .slice(start, start + query.pageSize)
        .map((record) => cloneQuestionRecord(record))

      return {
        records: pagedRecords,
        total: filteredRecords.length,
        allTotal: records.length,
        matchingPublishedTotal: filteredRecords.filter((record) => record.status === 'published').length,
        matchingLatestUpdatedAt: getLatestUpdatedAt(filteredRecords),
        page: query.page,
        pageSize: query.pageSize,
      }
    },

    createQuestion(input) {
      const record = materializeQuestionRecord({
        input,
        id: createId(),
        updatedAt: now(),
      })

      records = [record, ...records]
      return cloneQuestionRecord(record)
    },

    updateQuestion(id, input) {
      const recordIndex = records.findIndex((record) => record.id === id)

      if (recordIndex < 0) {
        throw new Error(`Question ${id} not found`)
      }

      const updatedRecord = materializeQuestionRecord({
        input,
        id,
        updatedAt: now(),
      })

      records = records.map((record, index) => (index === recordIndex ? updatedRecord : record))
      return cloneQuestionRecord(updatedRecord)
    },

    deleteQuestion(id) {
      let deletedRecord: QuestionRecord | undefined

      records = records.filter((record) => {
        if (record.id === id) {
          deletedRecord = record
          return false
        }

        return true
      })

      return {
        deleted: deletedRecord ? cloneQuestionRecord(deletedRecord) : undefined,
        total: records.length,
      }
    },
  }
}

export function matchesQuestionQuery(record: QuestionRecord, query: QuestionQueryState): boolean {
  if (query.subjectId.length > 0 && record.subjectId !== query.subjectId) {
    return false
  }

  if (query.chapterId.length > 0 && record.chapterId !== query.chapterId) {
    return false
  }

  if (query.type !== 'all' && record.type !== query.type) {
    return false
  }

  if (query.difficulty !== 'all' && record.difficulty !== query.difficulty) {
    return false
  }

  const normalizedKeyword = normalizeSearch(query.keyword)

  if (normalizedKeyword.length === 0) {
    return true
  }

  return createSearchHaystack(record).includes(normalizedKeyword)
}

function createSearchHaystack(record: QuestionRecord): string {
  const sharedValues = [
    record.stem,
    record.knowledgePoint,
    record.analysis,
    getQuestionSubjectLabel(record.subjectId),
    getQuestionChapterLabel(record.chapterId),
  ]

  switch (record.type) {
    case 'single':
    case 'multiple':
      return normalizeSearch([...sharedValues, ...record.content.options.map((option) => option.text)].join(' '))
    case 'short':
      return normalizeSearch([...sharedValues, record.content.answer, ...record.content.scoringPoints].join(' '))
    case 'coding':
      return normalizeSearch(
        [
          ...sharedValues,
          record.content.prompt,
          record.content.inputDescription,
          record.content.outputDescription,
          record.content.referenceSolution,
          ...record.content.examples.flatMap((example) => [example.input, example.output, example.explanation]),
          ...record.content.testCases.flatMap((testCase) => [testCase.input, testCase.output]),
        ].join(' '),
      )
  }
}

function materializeQuestionRecord(options: {
  input: QuestionMutationInput
  id: string
  updatedAt: string
}): QuestionRecord {
  const { input, id, updatedAt } = options

  switch (input.type) {
    case 'single':
    case 'multiple':
      return {
        ...input,
        id,
        updatedAt,
        content: {
          options: input.content.options.map((option) => ({ ...option })),
        },
      }
    case 'short':
      return {
        ...input,
        id,
        updatedAt,
        content: {
          answer: input.content.answer,
          scoringPoints: [...input.content.scoringPoints],
        },
      }
    case 'coding':
      return {
        ...input,
        id,
        updatedAt,
        content: {
          prompt: input.content.prompt,
          inputDescription: input.content.inputDescription,
          outputDescription: input.content.outputDescription,
          examples: input.content.examples.map((example) => ({ ...example })),
          testCases: input.content.testCases.map((testCase) => ({ ...testCase })),
          referenceSolution: input.content.referenceSolution,
        },
      }
  }
}

function cloneQuestionRecord(record: QuestionRecord): QuestionRecord {
  switch (record.type) {
    case 'single':
    case 'multiple':
      return {
        ...record,
        content: {
          options: record.content.options.map((option) => ({ ...option })),
        },
      }
    case 'short':
      return {
        ...record,
        content: {
          answer: record.content.answer,
          scoringPoints: [...record.content.scoringPoints],
        },
      }
    case 'coding':
      return {
        ...record,
        content: {
          prompt: record.content.prompt,
          inputDescription: record.content.inputDescription,
          outputDescription: record.content.outputDescription,
          examples: record.content.examples.map((example) => ({ ...example })),
          testCases: record.content.testCases.map((testCase) => ({ ...testCase })),
          referenceSolution: record.content.referenceSolution,
        },
      }
  }
}

function createQuestionIdFactory(records: QuestionRecord[]): () => string {
  let nextId =
    records.reduce((maxId, record) => {
      const numericPart = Number(record.id.replace('question-', ''))
      return Number.isFinite(numericPart) ? Math.max(maxId, numericPart) : maxId
    }, 0) + 1

  return () => `question-${nextId++}`
}

function getLatestUpdatedAt(records: QuestionRecord[]): string | null {
  if (records.length === 0) {
    return null
  }

  const firstRecord = records[0]!
  const restRecords = records.slice(1)

  return restRecords.reduce(
    (latest, record) => (Date.parse(record.updatedAt) > Date.parse(latest) ? record.updatedAt : latest),
    firstRecord.updatedAt,
  )
}

function compareByUpdatedAt(left: string, right: string, order: QuestionQueryState['sortOrder']): number {
  const diff = Date.parse(right) - Date.parse(left)
  return order === 'desc' ? diff : diff * -1
}

function normalizeSearch(value: string): string {
  return value.trim().toLocaleLowerCase()
}
