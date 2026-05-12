import 'dotenv/config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  DeleteCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

// Configure DynamoDB client
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

function tableName(collection) {
  return `${PREFIX}${collection}`;
}

export const db = {
  async list(collection: string, sort?: string, limit?: string | number) {
    const params = { TableName: tableName(collection) };
    const result = await docClient.send(new ScanCommand(params));
    let items = result.Items || [];

    if (sort) {
      const desc = sort.startsWith('-');
      const field = desc ? sort.slice(1) : sort;
      items.sort((a, b) => {
        const aVal = a[field] || '';
        const bVal = b[field] || '';
        if (aVal < bVal) return desc ? 1 : -1;
        if (aVal > bVal) return desc ? -1 : 1;
        return 0;
      });
    }
    if (limit) items = items.slice(0, parseInt(String(limit)));
    return items;
  },

  async filter(collection: string, query: Record<string, any> = {}, sort?: string, limit?: string | number) {
    const cleanQuery: Record<string, any> = {};
    for (const [key, value] of Object.entries(query)) {
      if (key !== 'sort' && key !== 'limit' && value !== undefined && value !== '') {
        cleanQuery[key] = value;
      }
    }

    const params: Record<string, any> = { TableName: tableName(collection) };

    if (Object.keys(cleanQuery).length > 0) {
      const filterParts = [];
      const exprNames = {};
      const exprValues = {};
      for (const [key, value] of Object.entries(cleanQuery)) {
        const safeKey = key.replace(/[^a-zA-Z0-9_]/g, '_');
        const nameKey = `#${safeKey}`;
        const valueKey = `:${safeKey}`;
        filterParts.push(`${nameKey} = ${valueKey}`);
        exprNames[nameKey] = key;
        exprValues[valueKey] = String(value);
      }
      params.FilterExpression = filterParts.join(' AND ');
      params.ExpressionAttributeNames = exprNames;
      params.ExpressionAttributeValues = exprValues;
    }

    const result = await docClient.send(new ScanCommand(params as any));
    let items = result.Items || [];

    if (sort) {
      const desc = sort.startsWith('-');
      const field = desc ? sort.slice(1) : sort;
      items.sort((a, b) => {
        const aVal = a[field] || '';
        const bVal = b[field] || '';
        if (aVal < bVal) return desc ? 1 : -1;
        if (aVal > bVal) return desc ? -1 : 1;
        return 0;
      });
    }
    if (limit) items = items.slice(0, parseInt(String(limit)));
    return items;
  },

  async getById(collection: string, id: string) {
    const result = await docClient.send(new GetCommand({
      TableName: tableName(collection),
      Key: { id },
    }));
    return result.Item || null;
  },

  async create(collection: string, data: any, createdBy = 'anonymous') {
    const newItem = {
      id: uuidv4(),
      ...data,
      created_by: createdBy,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
    };
    await docClient.send(new PutCommand({
      TableName: tableName(collection),
      Item: newItem,
    }));
    return newItem;
  },

  async update(collection: string, id: string, data: any) {
    const existing = await db.getById(collection, id);
    if (!existing) return null;
    const updatedItem = {
      ...existing,
      ...data,
      id: existing.id,
      created_date: existing.created_date,
      created_by: existing.created_by,
      updated_date: new Date().toISOString(),
    };
    await docClient.send(new PutCommand({
      TableName: tableName(collection),
      Item: updatedItem,
    }));
    return updatedItem;
  },

  async delete(collection: string, id: string) {
    const existing = await db.getById(collection, id);
    if (!existing) return false;
    await docClient.send(new DeleteCommand({
      TableName: tableName(collection),
      Key: { id },
    }));
    return true;
  },
};
