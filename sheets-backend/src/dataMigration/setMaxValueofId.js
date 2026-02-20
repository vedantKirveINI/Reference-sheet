const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setMaxValueofId() {
  const query = `
    SELECT 
      CONCAT(
        'SELECT setval(''',
        REPLACE(REPLACE(c.column_default, 'nextval(''', ''), '''::regclass)', ''),
        ''',',
        'COALESCE((SELECT MAX(CAST("', c.column_name, '" AS bigint)) + 1 FROM "', c.table_schema, '"."', c.table_name, '"),1),true);'
      ) AS set_seq
    FROM information_schema.columns c 
    WHERE c.column_name = '__id'
      AND c.column_default LIKE 'nextval%'
      AND EXISTS (
        SELECT 1 FROM table_meta tm 
        WHERE c.table_schema = tm.base_id 
          AND tm.status = 'active' 
          AND c.table_name = tm.id
      );
  `;

  const result = await prisma.$queryRawUnsafe(query);
  const errors = [];
  let promises = [];

  for (let i = 0; i < result.length; i++) {
    const { set_seq } = result[i];

    console.log('processing i-->>', i);

    const runThis = async () => {
      try {
        const set_seq_resp = await prisma.$queryRawUnsafe(set_seq);

        console.log('set_seq_resp-->>', set_seq_resp);
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

setMaxValueofId().catch(console.error);
