#!/usr/bin/env bash
# 在已有 Docker 容器 mysql8 中执行建库脚本
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env"
SQL_FILE="${ROOT_DIR}/docker/mysql/init.sql"
CONTAINER_NAME="${MYSQL_CONTAINER:-mysql8}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "缺少 .env，请先复制 .env.example 并填写 NUXT_MYSQL_PASSWORD"
  exit 1
fi

# 从 .env 读取密码（硬编码容器名 mysql8，与本机已有容器一致）
# shellcheck disable=SC1090
set -a
source "$ENV_FILE"
set +a

PASSWORD="${NUXT_MYSQL_PASSWORD:-}"
USER_NAME="${NUXT_MYSQL_USER:-root}"

if [[ -z "$PASSWORD" ]]; then
  echo "NUXT_MYSQL_PASSWORD 为空"
  exit 1
fi

if ! docker ps --format '{{.Names}}' | grep -qx "$CONTAINER_NAME"; then
  echo "容器 ${CONTAINER_NAME} 未运行"
  exit 1
fi

echo "正在向 ${CONTAINER_NAME} 导入 ${SQL_FILE} ..."
docker exec -i "$CONTAINER_NAME" mysql -u"$USER_NAME" -p"$PASSWORD" < "$SQL_FILE"
echo "完成：数据库 quote_journal 已就绪"
