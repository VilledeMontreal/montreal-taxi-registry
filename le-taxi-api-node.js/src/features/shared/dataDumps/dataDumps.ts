// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { QueryResult } from "pg";
import { postgrePool } from "../taxiPostgre/taxiPostgre";
import pgQueryStream = require("pg-query-stream");

async function getDateFromSql(
  table: string,
  column: string,
  operator?: string,
) {
  const result = operator
    ? await queryDateWithOperator(table, column, operator)
    : await queryDate(table, column);

  const date = result && result.rows.length > 0 && result.rows[0].lastdate;
  return date ?? "1990-01-01T00:00:00Z";
}

async function getLastDate(
  table: string,
  insertColumn: string,
  updateColumn: string,
  operator?: string,
): Promise<string> {
  const insertDate = await getDateFromSql(table, insertColumn, operator);
  const udpateDate = await getDateFromSql(table, updateColumn, operator);

  return insertDate > udpateDate ? insertDate : udpateDate;
}

async function buildDataDumpStream(
  selectAll: string,
  operator?: string,
): Promise<any> {
  const client = await postgrePool.connect();

  const query = operator ? addOperatorFilter(selectAll) : selectAll;
  const params = operator ? [operator] : [];
  const queryStream = new pgQueryStream(query, params);
  const stream = client.query(queryStream);
  stream.on("end", () => client.release());

  return stream;
}

async function queryDate(
  table: string,
  column: string,
): Promise<QueryResult<any>> {
  const query = `SELECT max(${column}) as lastDate FROM ${table}`;
  return await postgrePool.query(query);
}

async function queryDateWithOperator(
  table: string,
  column: string,
  operator: string,
): Promise<QueryResult<any>> {
  const query = `SELECT max(${column}) as lastDate FROM ${table}
    JOIN public."user" on ${table}.added_by = public."user".id WHERE public."user".email = $1::text`;
  return await postgrePool.query(query, [operator]);
}

function addOperatorFilter(selectAll: string) {
  // All data streams already join the "user" table to expose 'added_by_name'
  const [select, orderBy] = selectAll.split("ORDER BY");
  return `${select} WHERE public."user".email = $1::text ORDER BY ${orderBy}`;
}

export { getLastDate, buildDataDumpStream };
