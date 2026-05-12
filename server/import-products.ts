// Script to import products from Excel to DynamoDB
import 'dotenv/config';
import XLSX from 'xlsx';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

const TABLE = 'montega_products';

// Map categories from Excel to our app categories
function mapCategory(cat) {
  if (!cat) return 'VARIOS';
  const c = cat.toUpperCase().trim();
  if (c.includes('CERDO')) return 'CERDO';
  if (c.includes('RES')) return 'RES';
  if (c.includes('BORREGO')) return 'BORREGO';
  if (c.includes('MARISCO') || c.includes('PESCADO') || c.includes('CAMARON') || c.includes('PULPO')) return 'MARISCOS';
  if (c.includes('POLLO') || c.includes('AVE')) return 'POLLO';
  if (c.includes('PAPA')) return 'PAPAS';
  return 'VARIOS';
}

async function main() {
  console.log('\n📦 Importando productos desde Excel a DynamoDB\n');

  // Read Excel file
  const filePath = join(__dirname, '..', 'Lista de productos seleccionados (1).xlsx');
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws);

  console.log(`📄 Productos encontrados en Excel: ${rows.length}\n`);

  // First, delete old seed products
  console.log('🗑️  Eliminando productos anteriores...');
  const existing = await docClient.send(new ScanCommand({ TableName: TABLE }));
  if (existing.Items) {
    for (const item of existing.Items) {
      await docClient.send(new DeleteCommand({
        TableName: TABLE,
        Key: { id: item.id },
      }));
    }
    console.log(`   Eliminados ${existing.Items.length} productos anteriores\n`);
  }

  // Import new products
  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    const name = row['post_title'];
    if (!name) {
      skipped++;
      continue;
    }

    const price = parseFloat(row['regular_price']) || 0;
    const category = mapCategory(row['tax:product_cat']);
    const description = row['post_excerpt'] || '';
    const fullDescription = row['post_content'] || description;
    const ingredient = row['meta:product_ingredient'] || '';
    const imageUrl = row['images'] || '';
    const inStock = (row['stock_status'] || 'instock') === 'instock';

    const product = {
      id: uuidv4(),
      name: name.trim(),
      description: description.trim(),
      full_description: fullDescription.trim(),
      category,
      price,
      image_url: imageUrl.trim(),
      ingredient: ingredient.trim(),
      in_stock: inStock,
      created_by: 'admin',
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
    };

    try {
      await docClient.send(new PutCommand({
        TableName: TABLE,
        Item: product,
      }));
      imported++;
      console.log(`  ✅ ${imported}. ${name} - $${price} (${category})`);
    } catch (err) {
      console.error(`  ❌ Error con ${name}: ${err.message}`);
    }
  }

  console.log(`\n🎉 ¡Importación completada!`);
  console.log(`   ✅ Importados: ${imported}`);
  console.log(`   ⏭️  Omitidos: ${skipped}`);
  console.log(`   📊 Total en DynamoDB: ${imported}\n`);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
