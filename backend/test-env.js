import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');
console.log('📁 .env path:', envPath);
console.log('📁 File exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  console.log('\n📄 File content:');
  const content = fs.readFileSync(envPath, 'utf8');
  console.log(content);

  console.log('\n🔍 Parsing .env file:');
  dotenv.config({ path: envPath });

  console.log('DEEPSEEK_API_KEY:', process.env.DEEPSEEK_API_KEY ? '✅ Set' : '❌ Not set');
  console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Not set');
  console.log('PORT:', process.env.PORT || 'Not set');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');
} else {
  console.log('❌ .env file not found!');
  console.log('Please create .env file with:');
  console.log('DEEPSEEK_API_KEY=your_api_key_here');
  console.log('OPENAI_API_KEY=your_api_key_here');
  console.log('PORT=3000');
  console.log('NODE_ENV=development');
}
