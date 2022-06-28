// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export interface IPaginationQueryParams {
  page?: string;
  pageSize?: string;
  order?: string;
  filter?: string;
  operator?: string;
}

export interface ISqlClauses {
  filterBy: string;
  orderBy: string;
  limitBy: string;
  values: string[];
}
