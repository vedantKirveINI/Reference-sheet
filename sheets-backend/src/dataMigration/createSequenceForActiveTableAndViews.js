const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSequenceForActiveTableAndViews() {
  const query = `select tm.base_id as schema_name, tm.id as table_name,
  concat('"',tm.base_id, '"."', tm.id,'"') as q_table_name,
  concat('_row_view', v.id) as seq_name_and_col_name,
  concat('"',tm.base_id,'"."',concat('_row_view', v.id),'"') as q_seq_name,
  concat('CREATE SEQUENCE IF NOT EXISTS ',concat('"',tm.base_id,'"."',concat('_row_view', v.id),'"'),' START WITH 1 INCREMENT BY 1 NO CYCLE;') as script,
  concat('select setval(''',concat('"',tm.base_id,'"."',concat('_row_view', v.id),'"'),''',', 'coalesce((select max(cast(',concat('"_row_view', v.id, '"'),' as bigint)) + 1 from ',concat('"',tm.base_id, '"."', tm.id,'"'),'),1),true);') as set_seq,
  concat('alter table ',concat('"',tm.base_id, '"."', tm.id,'"'),' alter column ',concat('_row_view', v.id),' set default ', 'nextval(''',concat('"',tm.base_id,'"."',concat('_row_view', v.id),'"'),''');') as set_table_default
  from table_meta tm
  join "view" v on v.table_id = tm.id`;

  const result = await prisma.$queryRawUnsafe(query);

  const errors = [];

  let promises = [];

  for (let i = 0; i < result.length; i++) {
    const { script, set_seq, set_table_default } = result[i];

    console.log('processing i-->>', i);

    const runThis = async () => {
      try {
        const script_resp = await prisma.$queryRawUnsafe(script);
        const set_seq_resp = await prisma.$queryRawUnsafe(set_seq);
        const set_table_default_resp =
          await prisma.$queryRawUnsafe(set_table_default);

        console.log(
          'script_resp-->>',
          script_resp,
          'set_seq_resp-->>',
          set_seq_resp,
          'set_table_default_resp-->>',
          set_table_default_resp,
        );
      } catch (e) {
        errors.push(e);
      }
    };

    if (i % 20 === 0) {
      await Promise.all(promises);
      promises = [];
    } else {
      promises.push(runThis());
    }

    if (i === result.length - 1) {
      await Promise.all(promises);
    }
  }

  console.log('errors-->>', errors);
}

createSequenceForActiveTableAndViews();
