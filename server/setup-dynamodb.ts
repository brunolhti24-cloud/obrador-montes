// Script to create DynamoDB tables and seed initial data
import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env
try {
  const envPath = join(__dirname, '..', '.env');
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex > 0) {
        const key = trimmed.slice(0, eqIndex).trim();
        const value = trimmed.slice(eqIndex + 1).trim();
        if (!process.env[key]) process.env[key] = value;
      }
    }
  });
} catch { /* ignore */ }

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

const PREFIX = 'montega_';
const TABLES = ['products', 'orders', 'favorites', 'reviews', 'notifications', 'users', 'wholesale_inquiries'];

async function tableExists(name) {
  try {
    await client.send(new DescribeTableCommand({ TableName: name }));
    return true;
  } catch (e) {
    if (e.name === 'ResourceNotFoundException') return false;
    throw e;
  }
}

async function createTable(name) {
  const fullName = `${PREFIX}${name}`;

  try {
    const desc = await client.send(new DescribeTableCommand({ TableName: fullName }));
    console.log(`  ✅ Tabla ${fullName} ya existe (Account: ${desc.Table.TableArn.split(':')[4]})`);
    return;
  } catch (e) {
    if (e.name !== 'ResourceNotFoundException') throw e;
  }

  console.log(`  🔨 Creando tabla ${fullName}...`);

  await client.send(new CreateTableCommand({
    TableName: fullName,
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
    ],
    BillingMode: 'PAY_PER_REQUEST', // No need to set capacity, pay only for what you use
  }));

  // Wait for table to be active
  let active = false;
  while (!active) {
    const desc = await client.send(new DescribeTableCommand({ TableName: fullName }));
    if (desc.Table.TableStatus === 'ACTIVE') {
      active = true;
    } else {
      console.log(`     Esperando que ${fullName} esté activa...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log(`  ✅ Tabla ${fullName} creada`);
}

async function seedData(collection, dataFile) {
  const fullName = `${PREFIX}${collection}`;
  const filePath = join(__dirname, 'data', dataFile);

  let data;
  try {
    data = JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch {
    console.log(`  ⏭️  No hay datos para ${collection}`);
    return;
  }

  if (!Array.isArray(data) || data.length === 0) {
    console.log(`  ⏭️  Sin datos para ${collection}`);
    return;
  }

  console.log(`  📦 Insertando ${data.length} items en ${fullName}...`);

  for (const item of data) {
    try {
      await docClient.send(new PutCommand({
        TableName: fullName,
        Item: item,
        ConditionExpression: 'attribute_not_exists(id)', // Don't overwrite existing
      }));
    } catch (e) {
      if (e.name === 'ConditionalCheckFailedException') {
        // Item already exists, skip
      } else {
        console.error(`  ❌ Error insertando en ${fullName}:`, e.message);
      }
    }
  }

  console.log(`  ✅ Datos de ${collection} insertados`);
}

async function main() {
  console.log('\n🚀 Configurando DynamoDB para Montega\n');
  console.log('Región:', process.env.AWS_REGION || 'us-east-1');
  console.log('');

  // Create tables
  console.log('📋 Creando tablas...\n');
  for (const table of TABLES) {
    await createTable(table);
  }

  console.log('\n📦 Insertando datos iniciales...\n');

  // Seed products
  await seedData('products', 'products.json');

  // Seed admin user
  await seedData('users', 'users.json');

  console.log('\n✅ ¡Base de datos configurada exitosamente!\n');
  console.log('Tablas creadas:');
  TABLES.forEach(t => console.log(`  - ${PREFIX}${t}`));
  console.log('');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
