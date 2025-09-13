import { z } from "zod";
import { AttributeData, EntityData } from "../type/EntityType";

function attributeSchema(attr: AttributeData) {
    let schema: any;

    if (["boolean"].includes(attr.type)) {
        schema = z.boolean();
    } else if (["integer", "smallint", "largeint"].includes(attr.type)) {
        schema = z
            .number({
                description: `Must be an ${attr.type}`,
            })
            .int();
    } else if (["float", "double", "numeric"].includes(attr.type)) {
        const precision = attr.precision || 10;
        const scale = attr.scale || 0;
        schema = z.number({
            description: `Must be a ${attr.type}, with a maximum precision of ${precision} and a maximum scale of ${scale}`,
        });
    } else {
        let additionalDesc = "";
        if (attr.length && ["string"].includes(attr.type)) {
            additionalDesc = ` with a maximum length of ${attr.length}`;
        } else if (
            attr.isCurrent &&
            ["date", "time", "datetime", "timestamp"].includes(attr.type)
        ) {
            additionalDesc = ` the default value is the current ${attr.type}`;
        }
        schema = z.string({
            description: `Must be a ${attr.type}${additionalDesc}`,
        });
    }

    if (attr.isNullable) {
        schema = schema.nullable();
    }

    if (attr.defaultValue !== undefined) {
        schema = schema.default(attr.defaultValue);
    }

    if (attr.description) {
        const attrPropsDescription = [];
        if (attr.isPrimaryKey) {
            attrPropsDescription.push("This attribute is a Primary Key.");
        }
        if (attr.isAutoIncrement) {
            attrPropsDescription.push("This attribute is Auto Incremented.");
        }
        if (attr.isUnique) {
            attrPropsDescription.push("This attribute is Unique.");
        }
        if (attr.isUnicode) {
            attrPropsDescription.push("This attribute is Unicode.");
        }
        schema = schema.describe(
            attrPropsDescription.join(" ") + attr.description
        );
    }

    return schema;
}

export function generateZodSchema(nodesData: EntityData[]) {
    const entitiesObject: Record<string, any> = {};

    nodesData.forEach((nd) => {
        const entityName = nd.name;
        const attributes = nd.attributes;

        const attributesObject: Record<string, any> = {};
        attributes.forEach((attr) => {
            attributesObject[attr.name] = attributeSchema(attr);
        });

        entitiesObject[entityName] = z.array(z.object(attributesObject));
    });

    const entities = z.object(entitiesObject);

    return entities;
}

export function escapeSingleQuotes(str: string): string {
    return str.replace(/'/g, "\\'");
}
