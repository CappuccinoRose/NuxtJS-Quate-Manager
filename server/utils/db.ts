import mysql from 'mysql2/promise'

let pool: mysql.Pool | null = null

/** 单例连接池，避免每次请求新建连接 */
export function useDb() {
  if (pool) return pool

  const config = useRuntimeConfig()
  const mysqlConfig = config.mysql

  pool = mysql.createPool({
    host: mysqlConfig.host,
    port: Number(mysqlConfig.port),
    user: mysqlConfig.user,
    password: mysqlConfig.password,
    database: mysqlConfig.database,
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: false,
    // DATETIME 以字符串返回，便于前端直接展示
    dateStrings: true,
  })

  return pool
}
