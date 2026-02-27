import { PrismaClient } from '@prisma/client';
import lodash from 'lodash';

const prisma = new PrismaClient();

async function formatFilterAndUpdate() {
  console.log('Starting the migration process...');

  try {
    // Step 1: Fetch active tables
    const activeTables = await prisma.tableMeta.findMany({
      where: { status: 'active' },
      select: { id: true },
    });

    const activeTableIds = activeTables.map((table) => table.id);

    // Step 2: Fetch views associated with active tables where filter is not null
    console.time('Fetching views with filter...');
    const activeViewsWithFilter = await prisma.view.findMany({
      where: {
        tableId: { in: activeTableIds },
        filter: {
          not: null, // Ensure filter field is not null
        },
      },
      select: {
        id: true,
        filter: true,
        tableId: true,
      },
    });
    console.timeEnd('Fetching views with filter...');

    // Step 3: Fetch active fields
    console.time('Fetching active fields...');
    const activeFields = await prisma.field.findMany({
      where: {
        tableMetaId: { in: activeTableIds },
        status: 'active',
      },
    });
    console.timeEnd('Fetching active fields...');

    const field_not_found = [];
    const errors = [];
    const updateViewErrors = [];
    let updatedViewCount = 0;

    // Step 4: Update each view based on filter logic
    for (const view of activeViewsWithFilter) {
      const filter = view.filter;
      console.log('BEFORE-->>', filter);

      // Check if the filter is valid (non-empty)
      if (filter && !lodash.isEmpty(filter)) {
        try {
          const field_db_field_name = {};

          // get all dbFieldNames of fields
          getFilterFieldIds({ filter, field_db_field_name });

          Object.keys(field_db_field_name).forEach((db_field_name) => {
            const field = activeFields.find(
              (field) =>
                field.tableMetaId === view.tableId &&
                field.dbFieldName === db_field_name,
            );

            if (field) {
              const id = field.id;
              field_db_field_name[db_field_name] = id;
            } else {
              field_not_found.push({
                viewId: view.id,
                dbFieldName: db_field_name,
              });
            }
          });

          console.log('field_db_field_name-->>', field_db_field_name);

          const update_filter = updateFilterFields({
            filter,
            field_db_field_name,
          });

          console.log('update_filter-->>', JSON.stringify(update_filter));

          // Apply any transformation logic you need here
          //   const updatedFilter = transformFilter(
          //     filter,
          //     activeFields,
          //     field_db_field_name,
          //   );

          // Step 5: Update the view with the new filter
          await prisma.view.update({
            where: { id: view.id },
            data: { filter: update_filter },
          });

          updatedViewCount++;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          updateViewErrors.push({ viewId: view.id, error: errorMessage });
          console.error(`Error updating view "${view.id}":`, errorMessage);
        }
      }
    }

    return { errors, updatedViewCount, updateViewErrors };
  } catch (e) {
    console.error('Error in migration:', e);
  } finally {
    await prisma.$disconnect();
  }
}

// Function to transform filter based on the active fields
function updateFilterFields({ filter, field_db_field_name }) {
  // Recursive function to traverse and update nodes
  function traverseAndUpdate(node) {
    if ('field' in node) {
      console.log('Processing node with field:', node.field);

      // If the node is a LeafNode and has a 'field' key
      const dbFieldName = node.field; // Current field value
      if (field_db_field_name.hasOwnProperty(dbFieldName)) {
        console.log(
          'Updating field value:',
          dbFieldName,
          'to',
          field_db_field_name[dbFieldName],
        );
        node.field = field_db_field_name[dbFieldName]; // Replace with mapped value
      } else {
        console.warn('No mapping found for field:', dbFieldName);
      }
    } else if ('childs' in node && Array.isArray(node.childs)) {
      console.log('Recursively processing child nodes...');
      // If the node is a GroupNode, recursively update its childs
      node.childs.forEach(traverseAndUpdate);
    } else {
      console.warn('Node does not have a "field" or "childs" key:', node);
    }
  }

  if (filter && filter.childs && Array.isArray(filter.childs)) {
    console.log('Starting traversal for filter.childs...');
    filter.childs.forEach(traverseAndUpdate); // Start traversal from root nodes
  } else {
    console.error('Invalid filter structure:', filter);
  }

  return filter; // Return the updated filter
}

function getFilterFieldIds({ filter, field_db_field_name }) {
  function traverseNode(node) {
    // Check if the node has a 'field' key (LeafNodeSchema)
    if ('field' in node) {
      console.log('Inside LeafNode: Field detected');

      // Add the field to the mapping with a default value (you can adjust this as needed)
      if (node.field && !field_db_field_name[node.field]) {
        field_db_field_name[node.field] = ''; // Assign a default value or perform any logic needed
      }
    } else if ('childs' in node && Array.isArray(node.childs)) {
      console.log('Inside GroupNode: Recursively checking child nodes');

      // GroupNodeSchema: Recursively traverse its children (childs)
      node.childs.forEach(traverseNode);
    }
  }

  // Ensure filter and its childs are valid before processing
  if (filter && filter.childs && Array.isArray(filter.childs)) {
    // Traverse each child node in the filter
    filter.childs.forEach(traverseNode);
  }

  return field_db_field_name; // Return the updated mapping
}

// Execute the migration script
const resp = await formatFilterAndUpdate();

console.log('Migration result:', resp);
