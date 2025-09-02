import z from "zod";

export const erdSchema = z.object({
    nodes: z
        .array(
            z.object({
                name: z.string().describe("Name of the entity."),
                attributes: z.array(
                    z.object({
                        name: z.string().describe("Name of the attribute."),
                        type: z
                            .enum([
                                "string",
                                "boolean",
                                "integer",
                                "float",
                                "date",
                                "uuid",
                                "smallint",
                                "largeint",
                                "double",
                                "numeric",
                                "text",
                                "time",
                                "datetime",
                                "timestamp",
                                "json",
                                "geometry",
                                "geography",
                            ])
                            .describe("Data type of the attribute."),
                        isNullable: z
                            .boolean()
                            .optional()
                            .describe("Whether the attribute can be null."),
                        defaultValue: z
                            .any()
                            .optional()
                            .describe(
                                "Default value of the attribute, depending on the data type."
                            ),
                        isCurrent: z
                            .boolean()
                            .optional()
                            .describe(
                                "When the data type of the attribute is datetime related. true = the default value is the current date/time."
                            ),
                        isPrimaryKey: z
                            .boolean()
                            .optional()
                            .describe(
                                "Whether the attribute is a primary key."
                            ),
                        isAutoIncrement: z
                            .boolean()
                            .optional()
                            .describe(
                                "Whether the attribute is auto-incrementing."
                            ),
                        isUnique: z
                            .boolean()
                            .optional()
                            .describe("Whether the attribute is unique."),
                        length: z
                            .number()
                            .optional()
                            .describe(
                                "Length of the attribute, if applicable."
                            ),
                        precision: z
                            .number()
                            .optional()
                            .describe(
                                "Precision of the attribute, if applicable."
                            ),
                        scale: z
                            .number()
                            .optional()
                            .describe("Scale of the attribute, if applicable."),
                        description: z
                            .string()
                            .optional()
                            .describe("Description of the attribute."),
                        isUnicode: z
                            .boolean()
                            .optional()
                            .describe("Whether the attribute is Unicode."),
                    })
                ),
            })
        )
        .describe("List of entity names and their attributes."),
    edges: z.array(
        z.object({
            source: z.string().describe("Name of the source entity."),
            foreignKey: z.string().describe("The foreign key attribute."),
            references: z.object({
                entity: z.string().describe("Name of the referenced entity."),
                attribute: z
                    .string()
                    .describe("Name of the referenced attribute."),
            }),
            relationship: z
                .enum(["zero-to-one", "one-to-one", "zero-to-many", "one-to-many", "many-to-many"])
                .describe("Type of the relationship."),
        })
    ),
});
