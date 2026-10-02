export const ADMIN_PAGE_SIZE = 15;

export function parsePage(page: string | undefined): number {
  const n = Number.parseInt(page ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export function paginationArgs(page: string | undefined) {
  const current = parsePage(page);
  return { skip: (current - 1) * ADMIN_PAGE_SIZE, take: ADMIN_PAGE_SIZE };
}
