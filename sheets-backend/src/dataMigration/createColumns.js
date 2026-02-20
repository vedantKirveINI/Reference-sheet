import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createColumns() {
  try {
    // 1. Fetch active tables from the tableMeta table
    const tables = await prisma.tableMeta.findMany({
      where: {
        status: 'active',
      },
      select: {
        dbTableName: true,
      },
    });

    // Variables to track the count of tables missing columns
    let missing_created_time_count = 0;
    let missing_last_modified_time_count = 0;

    for (const table of tables) {
      const db_table_name = table.dbTableName;

      // 2. Split the dbTableName to get schema and table names
      const [schema_name, table_name] = db_table_name.split('.');

      // 3. Check if __created_time and __last_modified_time exist in the table
      const columns = await prisma.$queryRawUnsafe(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = '${schema_name}' AND table_name = '${table_name}'
      `);

      const column_names = columns.map((col) => col.column_name);

      // 4. Add the columns if they do not exist
      const queries = [];

      if (!column_names.includes('__created_time')) {
        queries.push(`
          ALTER TABLE "${schema_name}".${table_name}
          ADD COLUMN "__created_time" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        `);
        missing_created_time_count++;
      }

      if (!column_names.includes('__last_modified_time')) {
        queries.push(`
          ALTER TABLE "${schema_name}".${table_name}
          ADD COLUMN "__last_modified_time" TIMESTAMP;
        `);
        missing_last_modified_time_count++;
      }

      // 5. Execute the queries if there are any changes
      for (const query of queries) {
        await prisma.$executeRawUnsafe(query);
        console.log(`Executed query for table ${db_table_name}: ${query}`);
      }
    }

    // 6. Log the counts of tables missing the columns
    console.log(
      `Total tables missing '__created_time': ${missing_created_time_count}`,
    );
    console.log(
      `Total tables missing '__last_modified_time': ${missing_last_modified_time_count}`,
    );
  } catch (error) {
    console.error('Error creating columns:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createColumns().catch((error) => console.error(error));
