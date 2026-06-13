export function isMissingSchemaColumn(error: { message?: string; code?: string } | null | undefined) {
  return Boolean(
    error &&
      (error.code === 'PGRST204' ||
        error.message?.toLowerCase().includes('schema cache') ||
        error.message?.toLowerCase().includes('column') ||
        error.message?.toLowerCase().includes('does not exist'))
  )
}

export function withoutOptionalColumns<T extends Record<string, unknown>>(payload: T, columns: string[]) {
  const cleaned = { ...payload }
  columns.forEach((column) => {
    delete cleaned[column]
  })
  return cleaned
}
