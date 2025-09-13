import { ErdEdgeData } from "../type/EdgeType";
import { AttributeData, EntityData } from "../type/EntityType";
import { escapeSingleQuotes } from "./schema";

function mapDataType(column: AttributeData): string {
    const typeMap: Record<string, string> = {
        boolean: "TINYINT(1)",
        smallint: "SMALLINT",
        integer: "INT",
        largeint: "BIGINT",
        float: "FLOAT",
        double: "DOUBLE",
        numeric: "NUMERIC",

        string: "VARCHAR",
        text: "MEDIUMTEXT",
        uuid: "CHAR(36)",

        date: "DATE",
        time: "TIME",
        datetime: "DATETIME",
        timestamp: "TIMESTAMP",

        json: "JSON",
        geometry: "GEOMETRY",
        geography: "POINT SRID",
    };

    let type = typeMap[column.type.toLowerCase()];
    if (column.type.toLowerCase() === "string") {
        const len = column.length || 255;
        type += `(${len})`;
    } else if (column.type.toLowerCase() === "numeric") {
        const precision = column.precision || 10;
        const scale = column.scale || 0;
        type += `(${precision}, ${scale})`;
    }

    return type;
}

function createFieldMySql(column: AttributeData): string {
    let sql = `    ${column.name} ${mapDataType(column)}`;

    if (column.isAutoIncrement) {
        if (
            [
                "smallint",
                "integer",
                "largeint",
                "float",
                "double",
                "numeric",
            ].indexOf(column.type) > -1
        ) {
            sql += " AUTO_INCREMENT";
        }
    }

    if (column.isPrimaryKey) {
        sql += " PRIMARY KEY";
    } else if (column.isUnique) {
        sql += " UNIQUE";
    }

    if (column.isNullable === false) {
        sql += " NOT NULL";
    }

    if (!column.isAutoIncrement) {
        if (
            (column.type === "timestamp" || column.type === "datetime") &&
            column.isCurrent
        ) {
            sql += " DEFAULT CURRENT_TIMESTAMP";
        } else if (column.type === "date" && column.isCurrent) {
            sql += ` DEFAULT CURRENT_DATE`;
        } else if (column.type === "time" && column.isCurrent) {
            sql += ` DEFAULT CURRENT_TIME`;
        } else if (column.defaultValue !== undefined) {
            let defaultVal = "";
            if (column.defaultValue === null) {
                defaultVal = "NULL";
            } else {
                defaultVal = ["string", "text"].includes(column.type)
                    ? `'${escapeSingleQuotes(column.defaultValue)}'`
                    : column.defaultValue;
            }
            sql += ` DEFAULT ${defaultVal}`;
        }
    }

    if (column.isUnicode) {
        sql += " CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci";
    }

    if (column.description) {
        sql += ` COMMENT '${column.description}'`;
    }

    return sql;
}

function createTableMySql(entity: EntityData): string {
    const tableName = entity.name;
    const columns = entity.attributes.map(createFieldMySql);

    const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (\n${columns.join(
        ",\n"
    )}\n);`;

    return sql;
}

function createForeignKeyMySql(edge: ErdEdgeData): string {
    const {
        primaryKeyColumn,
        primaryKeyTable,
        foreignKeyColumn,
        foreignKeyTable,
        onDelete,
        onUpdate,
    } = edge;
    if (
        !primaryKeyColumn ||
        !primaryKeyTable ||
        !foreignKeyColumn ||
        !foreignKeyTable
    ) {
        return "";
    }

    let cascade = "";
    if (onDelete) {
        cascade += ` ON DELETE ${onDelete}`;
    }
    if (onUpdate) {
        cascade += ` ON UPDATE ${onUpdate}`;
    }
    return (
        `ALTER TABLE ${foreignKeyTable} ` +
        `ADD CONSTRAINT fk_${foreignKeyTable}_${primaryKeyTable} ` +
        `FOREIGN KEY (${foreignKeyColumn}) ` +
        `REFERENCES ${primaryKeyTable}(${primaryKeyColumn})${cascade};`
    );
}

export function generateMySql(
    nodesData: EntityData[],
    edgesData: ErdEdgeData[]
): string {
    const sqlStatements: string[] = [];
    nodesData.forEach((nd) => {
        const createTableSql = createTableMySql(nd);
        sqlStatements.push(createTableSql);
    });
    edgesData.forEach((ed) => {
        if (!ed) return;
        const createForeignKeySql = createForeignKeyMySql(ed);
        if (createForeignKeySql) {
            sqlStatements.push(createForeignKeySql);
        }
    });

    return sqlStatements.join("\n\n");
}

export function generateInsertsMySql(data: any): string {
    const insertStatements: string[] = [];

    for (const entityName in data) {
        const list = data[entityName];

        for (const item of list) {
            const keys = Object.keys(item);
            const values = Object.values(item);

            const sql = `INSERT INTO ${entityName} (${keys.join(
                ", "
            )}) \nVALUES (${values
                .map((v) => {
                    if (v === null) {
                        return "NULL";
                    }
                    if (typeof v === "boolean") {
                        return v ? 1 : 0;
                    }
                    if (typeof v === "object") {
                        return `'${escapeSingleQuotes(JSON.stringify(v))}'`;
                    }
                    return typeof v === "string"
                        ? `'${escapeSingleQuotes(v)}'`
                        : v;
                })
                .join(", ")});`;
            insertStatements.push(sql);
        }
        insertStatements.push("\n\n");
    }

    return insertStatements.join("\n");
}
