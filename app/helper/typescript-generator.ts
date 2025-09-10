import { ErdEdgeData } from "../type/EdgeType";
import { AttributeData, EntityData } from "../type/EntityType";

function mapDataType(column: AttributeData): string {
    const typeMap: Record<string, string> = {
        boolean: "boolean",
        smallint: "number",
        integer: "number",
        largeint: "number",
        float: "number",
        double: "number",
        numeric: "number",

        string: "string",
        text: "string",
        uuid: "string",

        date: "string",
        time: "string",
        datetime: "string",
        timestamp: "string",

        json: "Record<string, any>",
        geometry: "string",
        geography: "string",
    };

    let type = typeMap[column.type.toLowerCase()];

    return type;
}

function createAttributeTs(column: AttributeData): string {
    let sql = `    ${column.name}`;

    sql += column.isNullable ? "?: " : ": ";
    sql += mapDataType(column) + ";";

    if (column.description) {
        sql += ` /** ${column.description} */`;
    }

    return sql;
}

function createInterfaceTs(entity: EntityData): string {
    const tableName = entity.name;
    const columns = entity.attributes.map(createAttributeTs);

    let tsType = `interface ${tableName} {\n${columns.join("\n")}\n}`;

    return tsType;
}

export function generateTs(
    nodesData: EntityData[],
    edgesData: ErdEdgeData[]
): string {
    const tsTypes: string[] = [];
    nodesData.forEach((nd) => {
        const createTableSql = createInterfaceTs(nd);
        tsTypes.push(createTableSql);
    });

    return tsTypes.join("\n\n");
}

export function generateDataTs(data: any): string {
    const tsObjects: string[] = [];

    for (const entityName in data) {
        let ts = `const ${entityName}Data: ${entityName}[] = `;
        ts += JSON.stringify(data[entityName], null, 4);
        ts += `;\n`;
        tsObjects.push(ts);
    }

    return tsObjects.join("\n");
}
