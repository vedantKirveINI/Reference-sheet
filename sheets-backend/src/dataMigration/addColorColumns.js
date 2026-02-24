import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addColorColumns() {
  try {
    const tables = await prisma.tableMeta.findMany({
      where: {
        status: 'active',
      },
      select: {
        dbTableName: true,
      },
    });

    let missing_row_color_count = 0;
    let missing_cell_colors_count = 0;

    for (const table of tables) {
      const db_table_name = table.dbTableName;

      const [schema_name, table_name] = db_table_name.split('.');

      const columns = await prisma.$queryRawUnsafe(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = '${schema_name}' AND table_name = '${table_name}'
      `);

      const column_names = columns.map((col) => col.column_name);

      const queries = [];

      if (!column_names.includes('__row_color')) {
        queries.push(`
          ALTER TABLE "${schema_name}".${table_name}
          ADD COLUMN "__row_color" VARCHAR(20) DEFAULT NULL;
        `);
        missing_row_color_count++;
      }

      if (!column_names.includes('__cell_colors')) {
        queries.push(`
          ALTER TABLE "${schema_name}".${table_name}
          ADD COLUMN "__cell_colors" JSONB DEFAULT NULL;
        `);
        missing_cell_colors_count++;
      }

      for (const query of queries) {
        await prisma.$executeRawUnsafe(query);
        console.log(`Executed query for table ${db_table_name}: ${query}`);
      }
    }

    console.log(
      `Total tables missing '__row_color': ${missing_row_color_count}`,
    );
    console.log(
      `Total tables missing '__cell_colors': ${missing_cell_colors_count}`,
    );
  } catch (error) {
    console.error('Error adding color columns:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addColorColumns().catch((error) => console.error(error));
