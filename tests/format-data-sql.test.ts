import { describe, expect, it } from 'vitest'

import { formatDataSql } from '../scripts/format-data-sql'

const DUMP = `
DROP TABLE IF EXISTS \`customers\`;
CREATE TABLE \`customers\` (
  id bigint NOT NULL AUTO_INCREMENT,
  name varchar(100) NOT NULL,
  PRIMARY KEY (id)
);
LOCK TABLES \`customers\` WRITE;
INSERT INTO \`customers\` VALUES (1,'ACME'),(2,'Globex');
UNLOCK TABLES;
`

describe('formatDataSql', () => {
  it('removes destructive DROP TABLE statements', () => {
    expect(formatDataSql(DUMP)).not.toMatch(/DROP TABLE/)
  })

  it('creates tables only when missing', () => {
    expect(formatDataSql(DUMP)).toContain('CREATE TABLE IF NOT EXISTS `customers`')
  })

  it('turns inserts into insert-if-absent', () => {
    expect(formatDataSql(DUMP)).toContain(
      "INSERT IGNORE INTO `customers` VALUES (1,'ACME'),(2,'Globex');",
    )
  })

  it('removes table locks', () => {
    expect(formatDataSql(DUMP)).not.toMatch(/LOCK TABLES|UNLOCK TABLES/)
  })

  it('is stable when applied repeatedly', () => {
    expect(formatDataSql(formatDataSql(DUMP))).toBe(formatDataSql(DUMP))
  })
})
