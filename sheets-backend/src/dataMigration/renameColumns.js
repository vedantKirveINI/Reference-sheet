const { PrismaClient } = require('@prisma/client'); // Use require instead of import

const prisma = new PrismaClient();

async function renameColumns(errors) {
  // Your logic remains the same
  try {
    const tables = await prisma.tableMeta.findMany({
      select: { dbTableName: true },
    });

    for (const { dbTableName } of tables) {
      if (!dbTableName) {
        console.warn('Skipping null or undefined dbTableName.');
        continue;
      }

      const [schemaName, tableName] = dbTableName.split('.');

      try {
        const alterTableQueries = [
          `ALTER TABLE "${schemaName}"."${tableName}" RENAME COLUMN "id" TO "__id";`,
          `ALTER TABLE "${schemaName}"."${tableName}" RENAME COLUMN "status" TO "__status";`,
          `ALTER TABLE "${schemaName}"."${tableName}" RENAME COLUMN "created_by" TO "__created_by";`,
          `ALTER TABLE "${schemaName}"."${tableName}" RENAME COLUMN "last_updated_by" TO "__last_updated_by";`,
          `ALTER TABLE "${schemaName}"."${tableName}" RENAME COLUMN "created_time" TO "__created_time";`,
          `ALTER TABLE "${schemaName}"."${tableName}" RENAME COLUMN "last_modified_time" TO "__last_modified_time";`,
          `ALTER TABLE "${schemaName}"."${tableName}" RENAME COLUMN "version" TO "__version";`,
        ];

        for (const query of alterTableQueries) {
          await prisma.$executeRawUnsafe(query);
          console.log(`Renamed columns in table "${schemaName}.${tableName}"`);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        errors.push({ dbFieldName: dbTableName, error: errorMessage });
        console.error(
          `Error renaming columns in table "${dbTableName}":`,
          errorMessage,
        );
      }
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching table names:', errorMessage);
  } finally {
    await prisma.$disconnect();
  }

  if (errors.length > 0) {
    console.log('Errors encountered during execution:', errors);
  }
}

// Prepare the errors array and execute the function
const errors = [];
renameColumns(errors);
