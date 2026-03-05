export function parsePaginationParams(
  page?: string,
  limit?: string,
): { page: number; limit: number } {
  const parsedPage = page ? parseInt(page, 10) : 1;
  const parsedLimit = limit ? parseInt(limit, 10) : 10;
  return {
    page: Number.isFinite(parsedPage) && parsedPage >= 1 ? parsedPage : 1,
    limit: Number.isFinite(parsedLimit) && parsedLimit >= 1 ? parsedLimit : 10,
  };
}

export function buildPaginationResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
) {
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
