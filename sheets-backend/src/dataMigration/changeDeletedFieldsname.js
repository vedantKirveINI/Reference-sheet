const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Function to generate the deleted field name
function getDeletedFieldName(dbFieldName) {
  const trimmedFieldName = dbFieldName.trim();
  const prefix = 'del_';
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0]; // Format: YYYYMMDDTHHMMSS
  const maxLength = 63;
  const availableLength = maxLength - (prefix.length + timestamp.length + 1); // +1 for the underscore
  const finalFieldName =
    availableLength > 0 ? trimmedFieldName.slice(0, availableLength) : '';
  return `${prefix}${finalFieldName}_${timestamp}`;
}

async function renameColumns(errors) {
  try {
    // Fetch all inactive fields
    const inactive_fields = await prisma.field.findMany({
      where: {
        status: 'inactive',
      },
    });

    // Extract all unique tableMetaIds from inactive fields
    const table_ids = inactive_fields
      .map((field) => field.tableMetaId)
      .filter(Boolean); // Ensuring tableMetaId is not null

    // Fetch all tables whose ids are in the extracted tableMetaIds
    const tables = await prisma.tableMeta.findMany({
      where: {
        id: {
          in: table_ids,
        },
      },
    });

    // Loop over each inactive field and perform necessary operations
    for (const inactive_field of inactive_fields) {
      const table_id = inactive_field.tableMetaId; // Adjusted to tableMetaId
      const dbFieldName = inactive_field.dbFieldName;

      const table = tables.find((t) => t.id === table_id);
      if (table) {
        const dbTableName = table.dbTableName;
        const [schemaName, tableName] = dbTableName.split('.');

        // Generate deleted DB field name
        const deletedFieldName = getDeletedFieldName(dbFieldName);

        const alter_query = `ALTER TABLE "${schemaName}".${tableName} RENAME COLUMN "${dbFieldName}" TO "${deletedFieldName}";`;

        try {
          await prisma.$transaction(async (prisma) => {
            // Execute the raw SQL query to rename the column
            await prisma.$executeRawUnsafe(alter_query);
            console.log(
              `Renamed column ${dbFieldName} to ${deletedFieldName} in table ${tableName}`,
            );

            // Update the dbFieldName in the field table
            const field = await prisma.field.update({
              where: {
                id: inactive_field.id,
              },
              data: {
                dbFieldName: deletedFieldName,
              },
            });

            console.log('field updated -->>', field);
          });
        } catch (error) {
          console.error(`Failed to execute query: ${alter_query}`, error);
          errors.push(
            `Failed to rename column ${dbFieldName} in table ${tableName}: ${error.message}`,
          );
        }
      } else {
        errors.push(`Table with id ${table_id} not found`);
      }
    }
  } catch (error) {
    console.error('Error during renameColumns execution:', error);
    errors.push(error.message);
  } finally {
    await prisma.$disconnect();
    if (errors.length > 0) {
      console.error('Errors encountered:', errors);
    } else {
      console.log('Renaming process completed successfully');
    }
  }
}

// Prepare the errors array and execute the function
const errors = [];
renameColumns(errors).catch((e) => {
  console.error(e);
});
