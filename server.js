// Сервер для конструктора резюме
// 1) отдаёт файлы из папки public
// 2) по адресу /api/ai отправляет запрос в Claude API (ключ берётся из .env)
//
// запуск: npm start

const http = require('http');
const fs = require('fs');
const path = require('path');

// ---- читаем .env ----
if (fs.existsSync('.env')) {
  const lines = fs.readFileSync('.env', 'utf8').split('\n');
  lines.forEach(function (line) {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const index = line.indexOf('=');
    if (index === -1) return;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  });
}

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ANTHROPIC_API_KEY || '';
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function sendJson(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

// собираем тело запроса
function readBody(req) {
  return new Promise(function (resolve, reject) {
    let body = '';
    req.on('data', function (chunk) {
      body += chunk;
      // не больше 15 МБ
      if (body.length > 15 * 1024 * 1024) {
        reject(new Error('слишком большой запрос'));
        req.destroy();
      }
    });
    req.on('end', function () {
      resolve(body);
    });
    req.on('error', reject);
  });
}

// запрос к Claude
async function askClaude(prompt, images) {
  const content = [];

  // картинки (скан резюме)
  if (images) {
    images.slice(0, 3).forEach(function (img) {
      content.push({
        type: 'image',
        source: { type: 'base64', media_type: img.media_type, data: img.data }
      });
    });
  }

  content.push({ type: 'text', text: prompt });

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4000,
      messages: [{ role: 'user', content: content }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.log('Ошибка Claude API:', response.status, errorText);
    const err = new Error('ошибка API');
    err.status = response.status === 429 ? 429 : 502;
    throw err;
  }

  const data = await response.json();

  let text = '';
  data.content.forEach(function (block) {
    if (block.type === 'text') text += block.text;
  });
  return text;
}

const server = http.createServer(async function (req, res) {
  try {
    // есть ли ключ
    if (req.url === '/api/health') {
      sendJson(res, 200, { ai: API_KEY !== '' });
      return;
    }

    // запрос к ИИ
    if (req.url === '/api/ai' && req.method === 'POST') {
      if (!API_KEY) {
        sendJson(res, 503, { error: 'нет ключа ANTHROPIC_API_KEY в .env' });
        return;
      }
      const body = JSON.parse(await readBody(req));
      if (!body.prompt) {
        sendJson(res, 400, { error: 'пустой запрос' });
        return;
      }
      const text = await askClaude(body.prompt, body.images);
      sendJson(res, 200, { text: text });
      return;
    }

    // обычные файлы из public
    let url = req.url.split('?')[0];
    if (url === '/') url = '/index.html';

    const filePath = path.join(__dirname, 'public', path.normalize(url));

    // чтобы нельзя было выйти из папки public
    if (!filePath.startsWith(path.join(__dirname, 'public'))) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.readFile(filePath, function (err, file) {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      const type = types[path.extname(filePath)] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': type });
      res.end(file);
    });
  } catch (e) {
    console.log(e);
    sendJson(res, e.status || 500, { error: e.message });
  }
});

server.listen(PORT, function () {
  console.log('Сайт запущен: http://localhost:' + PORT);
  if (!API_KEY) {
    console.log('ИИ выключен — добавь ANTHROPIC_API_KEY в файл .env');
  }
});
