export interface FilterOptions {
  keyword: string;
  size: number;
  page: number;
}

export interface Pagination {
  countItems: number;
  countPages: number;
  pageNumber: number;
  pageSize: number;
}