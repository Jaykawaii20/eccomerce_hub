export function parsePagination(query: Record<string, unknown>): {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
} {
  const page = Math.max(1, parseInt(String(query['page'] ?? '1'), 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(String(query['pageSize'] ?? '20'), 10)));
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}
