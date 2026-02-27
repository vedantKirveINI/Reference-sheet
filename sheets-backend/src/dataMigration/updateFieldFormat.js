import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Field format mapping based on field type
const FIELD_FORMAT_MAPPING = {
  SHORT_TEXT: '',
  LONG_TEXT: '',
  MCQ: [''],
  SCQ: '',
  PHONE_NUMBER: {
    countryCode: '',
    countryNumber: '',
    phoneNumber: '',
  },
  ZIP_CODE: {
    countryCode: '',
    zipCode: '',
  },
  DROP_DOWN: [
    {
      id: '',
      lable: '',
    },
  ],
  DROP_DOWN_STATIC: [''],
  YES_NO: '',
  EMAIL: '',
  DATE: '',
  CURRENCY: {
    countryCode: '',
    currencyCode: '',
    currencySymbol: '',
    currencyValue: 0,
  },
  NUMBER: 0,
  RATING: 0,
  FILE_PICKER: [
    {
      url: '',
      size: 0,
      mimeType: '',
    },
  ],
  TIME: {
    time: '',
    meridiem: '',
    ISOValue: '',
  },
  ADDRESS: {
    city: '',
    state: '',
    country: '',
    zipCode: '',
    fullName: '',
    addressLineOne: '',
    addressLineTwo: '',
  },
  SIGNATURE: '',
  FORMULA: null,
  LIST: [''],
  RANKING: [
    {
      id: '',
      label: '',
      rank: '',
    },
  ],
};

async function updateFieldFormat() {
  console.log('Starting field format update migration...');

  try {
    // Get fields that don't have fieldFormat set
    const fieldsToUpdate = await prisma.field.findMany({
      where: {
        status: 'active',
        fieldFormat: {
          equals: Prisma.DbNull,
        },
        type: {
          not: 'FORMULA',
        },
      },
      select: {
        id: true,
        name: true,
        type: true,
        fieldFormat: true,
      },
      orderBy: {
        createdTime: 'desc',
      },
    });

    console.log(`Found ${fieldsToUpdate.length} fields without fieldFormat`);

    // Group fields by type
    const fieldsByType = fieldsToUpdate.reduce((acc, field) => {
      const fieldType = field.type.toUpperCase();
      if (!acc[fieldType]) {
        acc[fieldType] = [];
      }
      acc[fieldType].push(field);
      return acc;
    }, {});

    console.log('Field types found:', Object.keys(fieldsByType));

    const updateResults = {
      updated: [],
      unknownTypes: [],
      errors: [],
      totalProcessed: fieldsToUpdate.length,
    };

    // Process each field type group in parallel (NO await inside map)
    const updatePromises = Object.entries(fieldsByType).map(
      ([fieldType, fields]) => {
        return (async () => {
          try {
            // Check if we have a format mapping for this field type
            if (FIELD_FORMAT_MAPPING.hasOwnProperty(fieldType)) {
              const fieldFormat = FIELD_FORMAT_MAPPING[fieldType];

              // Get field IDs for this type
              const fieldIds = fields.map((field) => field.id);

              // Bulk update all fields of this type
              const updateResult = await prisma.field.updateMany({
                where: {
                  id: { in: fieldIds },
                },
                data: { fieldFormat: fieldFormat },
              });

              console.log(
                `Updated ${updateResult.count} fields of type ${fieldType}`,
              );

              return {
                type: fieldType,
                count: updateResult.count,
                success: true,
                fieldIds: fieldIds,
                fieldFormat: fieldFormat,
              };
            } else {
              // Unknown field type
              const fieldIds = fields.map((field) => field.id);
              console.log(
                `Unknown field type: ${fieldType} (${fields.length} fields)`,
              );

              return {
                type: fieldType,
                count: fields.length,
                success: false,
                reason: 'unknown_type',
                fieldIds: fieldIds,
              };
            }
          } catch (error) {
            console.error(
              `Error updating fields of type ${fieldType}:`,
              error.message,
            );

            return {
              type: fieldType,
              count: fields.length,
              success: false,
              reason: 'error',
              error: error.message,
              fieldIds: fields.map((field) => field.id),
            };
          }
        })();
      },
    );

    // Wait for all updates to complete using Promise.allSettled
    const results = await Promise.allSettled(updatePromises);

    // Process results and populate updateResults
    results.forEach((result, index) => {
      const fieldType = Object.keys(fieldsByType)[index];
      const fields = fieldsByType[fieldType];

      if (result.status === 'fulfilled') {
        const data = result.value;

        if (data.success) {
          // Add all fields to updated results
          fields.forEach((field) => {
            updateResults.updated.push({
              id: field.id,
              name: field.name,
              type: field.type,
              fieldFormat: data.fieldFormat,
            });
          });
        } else if (data.reason === 'unknown_type') {
          // Add all fields to unknown types
          fields.forEach((field) => {
            updateResults.unknownTypes.push({
              id: field.id,
              name: field.name,
              type: field.type,
            });
          });
        } else if (data.reason === 'error') {
          // Add all fields to errors
          fields.forEach((field) => {
            updateResults.errors.push({
              id: field.id,
              name: field.name,
              type: field.type,
              error: data.error,
            });
          });
        }
      } else {
        // Promise was rejected
        console.error(
          `Promise rejected for field type ${fieldType}:`,
          result.reason,
        );
        fields.forEach((field) => {
          updateResults.errors.push({
            id: field.id,
            name: field.name,
            type: field.type,
            error: result.reason?.message || 'Promise rejected',
          });
        });
      }
    });

    // Summary
    console.log('\n=== MIGRATION SUMMARY ===');
    console.log(`Total fields processed: ${updateResults.totalProcessed}`);
    console.log(`Successfully updated: ${updateResults.updated.length}`);
    console.log(`Unknown field types: ${updateResults.unknownTypes.length}`);
    console.log(`Errors: ${updateResults.errors.length}`);

    console.log('\n=== UPDATE RESULTS BY TYPE ===');
    results.forEach((result, index) => {
      const fieldType = Object.keys(fieldsByType)[index];

      if (result.status === 'fulfilled') {
        const data = result.value;
        if (data.success) {
          console.log(`✅ ${fieldType}: ${data.count} fields updated`);
        } else {
          console.log(
            `❌ ${fieldType}: ${data.count} fields failed (${data.reason})`,
          );
        }
      } else {
        console.log(
          `💥 ${fieldType}: Promise rejected - ${result.reason?.message}`,
        );
      }
    });

    if (updateResults.unknownTypes.length > 0) {
      console.log('\n=== UNKNOWN FIELD TYPES ===');
      updateResults.unknownTypes.forEach((field) => {
        console.log(
          `- Field ID: ${field.id}, Name: ${field.name}, Type: ${field.type}`,
        );
      });
    }

    if (updateResults.errors.length > 0) {
      console.log('\n=== ERRORS ===');
      updateResults.errors.forEach((error) => {
        console.log(
          `- Field ID: ${error.id}, Name: ${error.name}, Type: ${error.type}, Error: ${error.error}`,
        );
      });
    }

    return updateResults;
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
const result = await updateFieldFormat();
console.log('\nMigration completed. Result:', result);
