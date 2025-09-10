import { ErdEdgeData } from "../type/EdgeType";
import { AttributeData, EntityData } from "../type/EntityType";
import { escapeSingleQuotes } from "./schema";

function mapDataType(column: AttributeData): string {
    const typeMap: Record<string, string> = {
        boolean: "BIT",
        smallint: "SMALLINT",
        integer: "INT",
        largeint: "BIGINT",
        float: "FLOAT(4)",
        double: "FLOAT(8)",
        numeric: "DECIMAL",

        string: "VARCHAR",
        text: "TEXT",
        uuid: "UNIQUEIDENTIFIER",

        date: "DATE",
        time: "TIME",
        datetime: "DATETIME2",
        timestamp: "DATETIME2",

        json: "NVARCHAR(MAX)",
        geometry: "GEOMETRY",
        geography: "GEOGRAPHY",
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

    if (["string", "text"].includes(column.type) && column.isUnicode) {
        type = "N" + type;
    }

    return type;
}

function createFieldSqlServer(column: AttributeData): string {
    let sql = `        ${column.name} ${mapDataType(column)}`;

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
            sql += " IDENTITY(1,1)";
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
            sql += " DEFAULT SYSDATETIME()";
        } else if (column.type === "date" && column.isCurrent) {
            sql += ` DEFAULT CAST(GETDATE() AS DATE)`;
        } else if (column.type === "time" && column.isCurrent) {
            sql += ` DEFAULT CAST(GETDATE() AS TIME)`;
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

    return sql;
}

function createTableSqlServer(entity: EntityData): string {
    const tableName = entity.name;
    const columns = entity.attributes.map(createFieldSqlServer);

    let sql =
        `IF NOT EXISTS (SELECT * FROM sys.tables ` +
        `WHERE name = '${tableName}' AND schema_id = SCHEMA_ID('dbo'))\n` +
        `BEGIN\n` +
        `    CREATE TABLE ${tableName} (\n${columns.join(",\n")}\n    );\n` +
        `END;\n`;

    entity.attributes.forEach((attr) => {
        if (attr.description) {
            sql +=
                `EXEC sp_addextendedproperty \n` +
                `    @name = N'MS_Description', \n` +
                `    @value = N'${escapeSingleQuotes(attr.description)}',\n` +
                `    @level0type = N'SCHEMA', @level0name = 'dbo',  \n` +
                `    @level1type = N'TABLE',  @level1name = '${tableName}',\n` +
                `    @level2type = N'COLUMN', @level2name = '${attr.name}';\n`;
        }
    });

    return sql;
}

function createForeignKeySqlServer(edge: ErdEdgeData): string {
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

export function generateSqlServer(
    nodesData: EntityData[],
    edgesData: ErdEdgeData[]
): string {
    const sqlStatements: string[] = [];
    nodesData.forEach((nd) => {
        const createTableSql = createTableSqlServer(nd);
        sqlStatements.push(createTableSql);
    });
    edgesData.forEach((ed) => {
        if (!ed) return;
        const createForeignKeySql = createForeignKeySqlServer(ed);
        if (createForeignKeySql) {
            sqlStatements.push(createForeignKeySql);
        }
    });

    return sqlStatements.join("\n\n");
}

export function generateInsertsSqlServer(data: any): string {
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
