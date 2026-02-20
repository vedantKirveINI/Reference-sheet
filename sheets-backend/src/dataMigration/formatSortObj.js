import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function formatSortObj() {
  console.log('inside this');

  try {
    const activeTables = await prisma.tableMeta.findMany({
      where: { status: 'active' },
      select: { id: true },
    });

    const active_table_ids = activeTables.map((table) => table.id);

    console.time('view start-->>');

    const activeViewsWithSort = await prisma.view.findMany({
      where: {
        tableId: { in: active_table_ids },
        //   status: 'active',
        sort: {
          not: null, // Ensures that the sort field is not null
        },
      },
      select: {
        id: true,
        sort: true,
      },
    });

    console.timeEnd('view start-->>');

    console.time('field');

    const activeFields = await prisma.field.findMany({
      where: {
        tableMetaId: { in: active_table_ids }, // Use the tableId here
        status: 'active',
      },
    });

    console.timeEnd('field');

    const errors = [];
    const update_view_errors = [];
    let updated_view_count = 0;

    for (const view of activeViewsWithSort) {
      if (view.sort.sortObjs.length > 0) {
        const sortObjs = view.sort.sortObjs.map((obj) => {
          const { dbFieldName } = obj;

          const field = activeFields.find(
            (field) =>
              field.dbFieldName == dbFieldName &&
              field.tableMetaId == view.tableId,
          );

          if (field) {
            obj.fieldId = field.id;
          } else {
            errors.push({
              viewId: view.id,
              dbFieldName,
            });
          }
          return obj;
        });

        const sort = {
          sortObjs: sortObjs,
          manualSort: false,
        };

        try {
          const updated_view = await prisma.view.update({
            where: {
              id: view.id,
            },
            data: {
              sort: sort,
            },
          });

          updated_view_count++;

          console.log('updated_view-->>', updated_view);
        } catch (e) {
          update_view_errors.push({
            viewId: view.id,
            error: e,
          });
        }
      }
    }
    return { errors, updated_view_count };
  } catch (e) {
    console.log('error', e);
  } finally {
    await prisma.$disconnect();
  }
}

const resp = await formatSortObj();

console.log('resp-->>', resp);
