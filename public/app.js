// =============================
//   Конструктор резюме
// =============================

// ---------- настройки ----------

const STORAGE_KEY = 'resume-data';

const colors = ['#1F6F5C', '#24407A', '#8A2E3B', '#3A3A3A', '#A6671B'];

const templates = [
  { id: 'classic', name: 'Классика' },
  { id: 'modern', name: 'Модерн' },
  { id: 'minimal', name: 'Минимал' }
];

const languages = [
  { id: 'ru', name: 'RU' },
  { id: 'ky', name: 'KG' },
  { id: 'en', name: 'EN' }
];

// заголовки разделов на разных языках
const titles = {
  ru: { summary: 'О себе', exp: 'Опыт работы', edu: 'Образование', skills: 'Навыки', langs: 'Языки', contacts: 'Контакты', now: 'н. в.' },
  ky: { summary: 'Өзүм жөнүндө', exp: 'Иш тажрыйбасы', edu: 'Билими', skills: 'Көндүмдөр', langs: 'Тилдер', contacts: 'Байланыш', now: 'азыр' },
  en: { summary: 'Profile', exp: 'Experience', edu: 'Education', skills: 'Skills', langs: 'Languages', contacts: 'Contacts', now: 'Present' }
};

// пример резюме, показываем при первом заходе
const exampleData = {
  template: 'modern',
  color: colors[0],
  lang: 'ru',
  photo: '',
  name: 'Айгерим Садыкова',
  title: 'Менеджер по маркетингу',
  email: 'aigerim@mail.kg',
  phone: '+996 555 123 456',
  city: 'Бишкек',
  link: 'linkedin.com/in/aigerim',
  summary: 'Пять лет в маркетинге розничных и девелоперских брендов. Запускаю рекламные кампании от брифа до отчёта, работаю с подрядчиками и бюджетом, считаю результат в заявках и продажах.',
  experience: [
    {
      role: 'Менеджер по маркетингу',
      company: 'Девелоперская компания',
      start: '03.2023',
      end: '',
      desc: 'Вела запуск двух жилых комплексов: медиаплан, наружная реклама, digital.\nСнизила стоимость заявки на 28% за полгода.\nКоординирую команду из дизайнера, SMM и подрядчиков.'
    },
    {
      role: 'SMM-специалист',
      company: 'Сеть кофеен',
      start: '06.2020',
      end: '02.2023',
      desc: 'Вела Instagram и TikTok сети из 9 точек.\nВырастила аудиторию с 4 до 38 тыс. подписчиков.'
    }
  ],
  education: [
    { school: 'КРСУ им. Б. Ельцина', degree: 'Бакалавр, маркетинг', start: '2016', end: '2020' }
  ],
  skills: 'Медиапланирование, Meta Ads, Google Analytics, Figma, Копирайтинг, Работа с бюджетом',
  languages: [
    { name: 'Кыргызский', level: 'родной' },
    { name: 'Русский', level: 'свободно' },
    { name: 'Английский', level: 'B2' }
  ],
  jobs: []
};

// пустые шаблоны для новых пунктов
function emptyExperience() {
  return { role: '', company: '', start: '', end: '', desc: '' };
}
function emptyEducation() {
  return { school: '', degree: '', start: '', end: '' };
}
function emptyLanguage() {
  return { name: '', level: '' };
}


// ---------- данные ----------

let data;
let isFirstVisit = false;

// пробуем достать сохранённое резюме
try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    data = JSON.parse(saved);
  }
} catch (e) {
  console.log('не получилось прочитать сохранение', e);
}

if (!data) {
  data = copy(exampleData);
  isFirstVisit = true;
}

if (!titles[data.lang]) {
  data.lang = 'ru';
}

// глубокая копия объекта
function copy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

let saveTimer;
function saveData() {
  // сохраняем не сразу, а через 300мс, чтобы не дёргать на каждую букву
  clearTimeout(saveTimer);
  saveTimer = setTimeout(function () {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      showToast('Не удалось сохранить: фото слишком большое');
    }
  }, 300);
}


// ---------- мелкие помощники ----------

// защита от html в тексте пользователя
function escapeHtml(text) {
  if (text === undefined || text === null) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

let toastTimer;
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toast.classList.remove('show');
  }, 2600);
}

// достать значение по пути вида "experience.0.role"
function getValue(path) {
  const parts = path.split('.');
  let value = data;
  for (let i = 0; i < parts.length; i++) {
    if (value === undefined || value === null) return '';
    value = value[parts[i]];
  }
  return value;
}

// записать значение по пути
function setValue(path, value) {
  const parts = path.split('.');
  let obj = data;
  for (let i = 0; i < parts.length - 1; i++) {
    obj = obj[parts[i]];
  }
  obj[parts[parts.length - 1]] = value;
}


// ---------- кнопки сверху (шаблон, цвет, язык) ----------

function renderTopButtons() {
  let html = '';
  for (let i = 0; i < templates.length; i++) {
    const t = templates[i];
    html += `<button type="button" data-template="${t.id}" aria-pressed="${data.template === t.id}">${t.name}</button>`;
  }
  document.getElementById('templateButtons').innerHTML = html;

  html = '';
  for (let i = 0; i < colors.length; i++) {
    const c = colors[i];
    html += `<button type="button" data-color="${c}" style="background:${c}" aria-pressed="${data.color === c}"></button>`;
  }
  document.getElementById('colorButtons').innerHTML = html;

  html = '';
  for (let i = 0; i < languages.length; i++) {
    const l = languages[i];
    html += `<button type="button" data-lang="${l.id}" aria-pressed="${data.lang === l.id}">${l.name}</button>`;
  }
  document.getElementById('langButtons').innerHTML = html;
}

document.getElementById('templateButtons').addEventListener('click', function (e) {
  if (e.target.dataset.template) {
    data.template = e.target.dataset.template;
    updateAll();
  }
});

document.getElementById('colorButtons').addEventListener('click', function (e) {
  if (e.target.dataset.color) {
    data.color = e.target.dataset.color;
    updateAll();
  }
});

document.getElementById('langButtons').addEventListener('click', function (e) {
  if (e.target.dataset.lang) {
    data.lang = e.target.dataset.lang;
    updateAll();
  }
});


// ---------- форма ----------

function input(label, path, placeholder) {
  return `
    <label for="field-${path}">${label}</label>
    <input type="text" id="field-${path}" data-path="${path}" value="${escapeHtml(getValue(path))}" placeholder="${escapeHtml(placeholder || '')}">
  `;
}

function textarea(label, path, placeholder) {
  return `
    <label for="field-${path}">${label}</label>
    <textarea id="field-${path}" data-path="${path}" placeholder="${escapeHtml(placeholder || '')}">${escapeHtml(getValue(path))}</textarea>
  `;
}

// кнопки вверх / вниз / удалить у пункта
function itemButtons(listName, index) {
  const isFirst = index === 0;
  const isLast = index === data[listName].length - 1;
  return `
    <div class="item-tools">
      <button type="button" class="icon" data-action="up" data-list="${listName}" data-index="${index}" ${isFirst ? 'disabled' : ''}>↑</button>
      <button type="button" class="icon" data-action="down" data-list="${listName}" data-index="${index}" ${isLast ? 'disabled' : ''}>↓</button>
      <button type="button" class="icon" data-action="delete" data-list="${listName}" data-index="${index}">✕</button>
    </div>
  `;
}

function aiButton(path) {
  if (!aiEnabled) return '';
  return `<div class="ai-line"><button type="button" class="ai" data-ai="${path}">Улучшить текст с ИИ</button></div>`;
}

function renderJobs() {
  if (!data.jobs || data.jobs.length === 0) return '';

  let html = '<div class="jobs">';
  html += '<h3>Какую работу искать' + (data.city ? ' — ' + escapeHtml(data.city) : '') + '</h3>';
  html += '<p class="note">Подборка от ИИ по вашему опыту. Нажмите «Найти вакансии» — откроем поиск на hh.kg, lalafo, LinkedIn и других сайтах.</p>';

  for (let i = 0; i < data.jobs.length; i++) {
    const job = data.jobs[i];

    html += '<div class="job">';
    html += '<b>' + escapeHtml(job.title) + '</b>';
    html += '<p>' + escapeHtml(job.why);
    if (job.where) html += ' Где искать: ' + escapeHtml(job.where) + '.';
    html += '</p>';
    html += '<button type="button" class="link-btn" data-find-job="' + escapeHtml(job.title) + '">Найти вакансии</button>';
    html += '</div>';
  }

  html += '<div style="margin-top:10px"><button type="button" class="btn ghost small" id="hideJobsBtn">Скрыть подборку</button></div>';
  html += '</div>';
  return html;
}

function renderForm() {
  // опыт работы
  let experienceHtml = '';
  for (let i = 0; i < data.experience.length; i++) {
    const item = data.experience[i];
    experienceHtml += `
      <div class="item">
        <div class="item-head">
          <strong>${escapeHtml(item.role) || 'Новое место работы'}</strong>
          ${itemButtons('experience', i)}
        </div>
        <div class="row">
          <div>${input('Должность', 'experience.' + i + '.role')}</div>
          <div>${input('Компания', 'experience.' + i + '.company')}</div>
        </div>
        <div class="row">
          <div>${input('Начало', 'experience.' + i + '.start', '03.2022')}</div>
          <div>${input('Окончание', 'experience.' + i + '.end', 'пусто — по настоящее время')}</div>
        </div>
        ${textarea('Что делали и чего добились', 'experience.' + i + '.desc', 'Каждое достижение с новой строки')}
        ${aiButton('experience.' + i + '.desc')}
      </div>
    `;
  }

  // образование
  let educationHtml = '';
  for (let i = 0; i < data.education.length; i++) {
    const item = data.education[i];
    educationHtml += `
      <div class="item">
        <div class="item-head">
          <strong>${escapeHtml(item.school) || 'Новое учебное заведение'}</strong>
          ${itemButtons('education', i)}
        </div>
        ${input('Учебное заведение', 'education.' + i + '.school')}
        ${input('Степень, специальность', 'education.' + i + '.degree')}
        <div class="row">
          <div>${input('Начало', 'education.' + i + '.start')}</div>
          <div>${input('Окончание', 'education.' + i + '.end')}</div>
        </div>
      </div>
    `;
  }

  // языки
  let languagesHtml = '';
  for (let i = 0; i < data.languages.length; i++) {
    const item = data.languages[i];
    languagesHtml += `
      <div class="item">
        <div class="item-head">
          <strong>${escapeHtml(item.name) || 'Язык'}</strong>
          ${itemButtons('languages', i)}
        </div>
        <div class="row">
          <div>${input('Язык', 'languages.' + i + '.name')}</div>
          <div>${input('Уровень', 'languages.' + i + '.level', 'B2, свободно…')}</div>
        </div>
      </div>
    `;
  }

  let photoStyle = 'none';
  if (data.photo) photoStyle = 'url(' + data.photo + ')';

  let removePhotoBtn = '';
  if (data.photo) removePhotoBtn = '<button type="button" class="btn ghost small" id="removePhotoBtn">Убрать</button>';

  document.getElementById('editor').innerHTML = `
    ${renderJobs()}

    <fieldset>
      <legend>Основное</legend>
      ${input('Имя и фамилия', 'name')}
      ${input('Желаемая должность', 'title')}
      <label>Фото</label>
      <div class="photo-row">
        <div class="thumb" style="background-image:${photoStyle}"></div>
        <label class="btn small" style="margin:0;color:var(--ink)">
          Загрузить
          <input type="file" accept="image/*" id="photoInput" hidden>
        </label>
        ${removePhotoBtn}
      </div>
    </fieldset>

    <fieldset>
      <legend>Контакты</legend>
      <div class="row">
        <div>${input('Email', 'email')}</div>
        <div>${input('Телефон', 'phone')}</div>
      </div>
      <div class="row">
        <div>${input('Город', 'city')}</div>
        <div>${input('Ссылка', 'link', 'сайт, LinkedIn, Telegram')}</div>
      </div>
    </fieldset>

    <fieldset>
      <legend>О себе <span class="hint">2–4 предложения</span></legend>
      ${textarea('Кто вы и чем полезны работодателю', 'summary')}
      ${aiButton('summary')}
    </fieldset>

    <fieldset>
      <legend>Опыт работы</legend>
      ${experienceHtml}
      <button type="button" class="btn small" data-add="experience">Добавить место работы</button>
    </fieldset>

    <fieldset>
      <legend>Образование</legend>
      ${educationHtml}
      <button type="button" class="btn small" data-add="education">Добавить учёбу</button>
    </fieldset>

    <fieldset>
      <legend>Навыки</legend>
      ${input('Через запятую', 'skills')}
    </fieldset>

    <fieldset>
      <legend>Языки</legend>
      ${languagesHtml}
      <button type="button" class="btn small" data-add="languages">Добавить язык</button>
    </fieldset>

    <fieldset>
      <legend>Данные</legend>
      <button type="button" class="btn small" id="clearBtn">Начать с чистого листа</button>
      <button type="button" class="btn small" id="exampleBtn">Показать пример</button>
      <p class="note">Всё, что вы вводите, сохраняется только в этом браузере.</p>
    </fieldset>
  `;
}

const editor = document.getElementById('editor');

// ввод текста в поля
editor.addEventListener('input', function (e) {
  const path = e.target.dataset.path;
  if (!path) return;

  setValue(path, e.target.value);

  // обновляем заголовок пункта, если поменяли должность / учёбу / язык
  if (path.endsWith('.role') || path.endsWith('.school') || path.endsWith('.name')) {
    const item = e.target.closest('.item');
    if (item) {
      item.querySelector('.item-head strong').textContent = e.target.value || '…';
    }
  }

  renderResume();
  saveData();
});

// клики по кнопкам в форме
editor.addEventListener('click', function (e) {
  const btn = e.target.closest('button');
  if (!btn) return;

  // добавить пункт
  if (btn.dataset.add === 'experience') data.experience.push(emptyExperience());
  if (btn.dataset.add === 'education') data.education.push(emptyEducation());
  if (btn.dataset.add === 'languages') data.languages.push(emptyLanguage());
  if (btn.dataset.add) {
    updateAll();
    return;
  }

  // вверх / вниз / удалить
  if (btn.dataset.action) {
    const list = data[btn.dataset.list];
    const i = Number(btn.dataset.index);

    if (btn.dataset.action === 'delete') {
      list.splice(i, 1);
    }
    if (btn.dataset.action === 'up' && i > 0) {
      const temp = list[i - 1];
      list[i - 1] = list[i];
      list[i] = temp;
    }
    if (btn.dataset.action === 'down' && i < list.length - 1) {
      const temp = list[i + 1];
      list[i + 1] = list[i];
      list[i] = temp;
    }
    updateAll();
    return;
  }

  if (btn.dataset.ai) {
    improveText(btn);
    return;
  }

  if (btn.dataset.findJob) {
    openJobs(btn.dataset.findJob);
    return;
  }

  if (btn.id === 'hideJobsBtn') {
    data.jobs = [];
    updateAll();
  }

  if (btn.id === 'removePhotoBtn') {
    data.photo = '';
    updateAll();
  }

  if (btn.id === 'clearBtn') {
    if (confirm('Очистить все поля?')) {
      data = {
        template: data.template,
        color: data.color,
        lang: data.lang,
        photo: '',
        name: '', title: '', email: '', phone: '', city: '', link: '',
        summary: '',
        experience: [emptyExperience()],
        education: [emptyEducation()],
        skills: '',
        languages: [emptyLanguage()],
        jobs: []
      };
      updateAll();
    }
  }

  if (btn.id === 'exampleBtn') {
    if (confirm('Заменить ваши данные примером?')) {
      data = copy(exampleData);
      updateAll();
    }
  }
});

// загрузка фото в форме
editor.addEventListener('change', async function (e) {
  if (e.target.id !== 'photoInput') return;
  const file = e.target.files[0];
  if (!file) return;

  try {
    data.photo = await makeSquarePhoto(file);
    updateAll();
  } catch (err) {
    showToast('Не удалось открыть фото');
  }
});

// обрезаем фото в квадрат 360x360
function makeSquarePhoto(file) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = function () {
      const img = new Image();
      img.onerror = reject;
      img.onload = function () {
        const size = 360;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;

        const side = Math.min(img.width, img.height);
        const x = (img.width - side) / 2;
        const y = (img.height - side) / 2;

        canvas.getContext('2d').drawImage(img, x, y, side, side, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}


// ---------- само резюме ----------

function period(start, end) {
  if (!start && !end) return '';
  let text = escapeHtml(start) + ' — ';
  if (end) {
    text += escapeHtml(end);
  } else {
    text += titles[data.lang].now;
  }
  return text;
}

function getContacts() {
  const list = [];
  if (data.email) list.push(escapeHtml(data.email));
  if (data.phone) list.push(escapeHtml(data.phone));
  if (data.city) list.push(escapeHtml(data.city));
  if (data.link) list.push(escapeHtml(data.link));
  return list;
}

function getSkills() {
  const list = [];
  const parts = String(data.skills || '').split(',');
  for (let i = 0; i < parts.length; i++) {
    const skill = parts[i].trim();
    if (skill) list.push(escapeHtml(skill));
  }
  return list;
}

function buildResumeHtml() {
  const t = titles[data.lang];

  // берём только заполненные пункты
  const experience = data.experience.filter(function (x) { return x.role || x.company || x.desc; });
  const education = data.education.filter(function (x) { return x.school || x.degree; });
  const langs = data.languages.filter(function (x) { return x.name; });
  const skills = getSkills();
  const contacts = getContacts();

  let photo = '';
  if (data.photo) photo = `<div class="ph" style="background-image:url(${data.photo})"></div>`;

  let name = escapeHtml(data.name);
  if (!name) name = '<span class="empty">Ваше имя</span>';

  let role = '';
  if (data.title) role = `<p class="role">${escapeHtml(data.title)}</p>`;

  let summary = '';
  if (data.summary) summary = `<section><h2>${t.summary}</h2><p class="desc">${escapeHtml(data.summary)}</p></section>`;

  // ===== Классика =====
  if (data.template === 'classic') {
    let html = `<div class="cv classic" style="--a:${data.color}">`;
    html += `<header>${photo}<div><h1>${name}</h1>${role}<div class="contacts">`;
    contacts.forEach(function (c) { html += `<span>${c}</span>`; });
    html += '</div></div></header>';
    html += summary;

    if (experience.length) {
      html += `<section><h2>${t.exp}</h2>`;
      experience.forEach(function (x) {
        html += `<div class="ent">
          <div class="ent-top"><h3>${escapeHtml(x.role)}</h3><span class="dates">${period(x.start, x.end)}</span></div>
          <p class="org">${escapeHtml(x.company)}</p>
          ${x.desc ? `<p class="desc">${escapeHtml(x.desc)}</p>` : ''}
        </div>`;
      });
      html += '</section>';
    }

    if (education.length) {
      html += `<section><h2>${t.edu}</h2>`;
      education.forEach(function (x) {
        html += `<div class="ent">
          <div class="ent-top"><h3>${escapeHtml(x.school)}</h3><span class="dates">${period(x.start, x.end)}</span></div>
          <p class="org">${escapeHtml(x.degree)}</p>
        </div>`;
      });
      html += '</section>';
    }

    if (skills.length) {
      html += `<section><h2>${t.skills}</h2><div class="tags">`;
      skills.forEach(function (s) { html += `<span>${s}</span>`; });
      html += '</div></section>';
    }

    if (langs.length) {
      html += `<section><h2>${t.langs}</h2><div class="tags">`;
      langs.forEach(function (x) {
        html += `<span>${escapeHtml(x.name)}${x.level ? ' — ' + escapeHtml(x.level) : ''}</span>`;
      });
      html += '</div></section>';
    }

    html += '</div>';
    return html;
  }

  // ===== Минимал =====
  if (data.template === 'minimal') {
    let html = `<div class="cv minimal" style="--a:${data.color}">`;
    html += `<div class="top"><div><h1>${name}</h1>${role}<div class="contacts">`;
    contacts.forEach(function (c) { html += `<span>${c}</span>`; });
    html += `</div></div>${photo}</div>`;
    html += summary;

    if (experience.length) {
      html += `<section><h2>${t.exp}</h2><div>`;
      experience.forEach(function (x) {
        html += `<div class="ent">
          <h3>${escapeHtml(x.role)}${x.company ? ', ' + escapeHtml(x.company) : ''}</h3>
          <p class="meta">${period(x.start, x.end)}</p>
          ${x.desc ? `<p class="desc">${escapeHtml(x.desc)}</p>` : ''}
        </div>`;
      });
      html += '</div></section>';
    }

    if (education.length) {
      html += `<section><h2>${t.edu}</h2><div>`;
      education.forEach(function (x) {
        let meta = escapeHtml(x.degree);
        if (x.degree && (x.start || x.end)) meta += ', ';
        meta += period(x.start, x.end);
        html += `<div class="ent"><h3>${escapeHtml(x.school)}</h3><p class="meta">${meta}</p></div>`;
      });
      html += '</div></section>';
    }

    if (skills.length) {
      html += `<section><h2>${t.skills}</h2><p>${skills.join(', ')}</p></section>`;
    }

    if (langs.length) {
      const langText = langs.map(function (x) {
        return escapeHtml(x.name) + (x.level ? ' (' + escapeHtml(x.level) + ')' : '');
      });
      html += `<section><h2>${t.langs}</h2><p>${langText.join(', ')}</p></section>`;
    }

    html += '</div>';
    return html;
  }

  // ===== Модерн (по умолчанию) =====
  let html = `<div class="cv modern" style="--a:${data.color}"><aside>${photo}`;

  if (contacts.length) {
    html += `<h2>${t.contacts}</h2>`;
    contacts.forEach(function (c) { html += `<p>${c}</p>`; });
  }

  if (skills.length) {
    html += `<h2>${t.skills}</h2><div>`;
    skills.forEach(function (s) { html += `<span class="chip">${s}</span>`; });
    html += '</div>';
  }

  if (langs.length) {
    html += `<h2>${t.langs}</h2>`;
    langs.forEach(function (x) {
      html += `<p>${escapeHtml(x.name)}${x.level ? ` <span class="lvl">· ${escapeHtml(x.level)}</span>` : ''}</p>`;
    });
  }

  html += `</aside><div class="body"><h1>${name}</h1>${role}${summary}`;

  if (experience.length) {
    html += `<section><h2>${t.exp}</h2>`;
    experience.forEach(function (x) {
      let meta = escapeHtml(x.company);
      if (x.company && (x.start || x.end)) meta += ' · ';
      meta += period(x.start, x.end);
      html += `<div class="ent">
        <h3>${escapeHtml(x.role)}</h3>
        <p class="meta">${meta}</p>
        ${x.desc ? `<p class="desc">${escapeHtml(x.desc)}</p>` : ''}
      </div>`;
    });
    html += '</section>';
  }

  if (education.length) {
    html += `<section><h2>${t.edu}</h2>`;
    education.forEach(function (x) {
      let meta = escapeHtml(x.degree);
      if (x.degree && (x.start || x.end)) meta += ' · ';
      meta += period(x.start, x.end);
      html += `<div class="ent"><h3>${escapeHtml(x.school)}</h3><p class="meta">${meta}</p></div>`;
    });
    html += '</section>';
  }

  html += '</div></div>';
  return html;
}

function renderResume() {
  document.getElementById('sheet').innerHTML = buildResumeHtml();
  fitSheet();
}

// уменьшаем лист A4, чтобы он влез в экран
function fitSheet() {
  const desk = document.getElementById('desk');
  const wrap = document.getElementById('sheetWrap');
  const sheet = document.getElementById('sheet');

  const padding = parseFloat(getComputedStyle(desk).paddingLeft);
  const freeWidth = desk.clientWidth - padding * 2;
  const scale = Math.min(1, freeWidth / 794);

  wrap.style.width = '794px';
  wrap.style.transform = 'scale(' + scale + ')';
  wrap.style.height = sheet.offsetHeight * scale + 'px';
  wrap.style.marginLeft = Math.max(0, (freeWidth - 794 * scale) / 2) + 'px';
}

window.addEventListener('resize', fitSheet);

// перерисовать всё
function updateAll() {
  renderTopButtons();
  renderForm();
  renderResume();
  saveData();
}


// ---------- вкладки на телефоне ----------

const tabs = document.querySelectorAll('.tab');
tabs.forEach(function (tab) {
  tab.addEventListener('click', function () {
    tabs.forEach(function (t) {
      t.setAttribute('aria-selected', t === tab);
    });
    document.getElementById('main').dataset.view = tab.dataset.view;
    if (tab.dataset.view === 'preview') {
      setTimeout(fitSheet, 0);
    }
  });
});


// ---------- скачать и печать ----------

// кнопка "Скачать резюме" — сразу отдаём PDF
document.getElementById('downloadBtn').addEventListener('click', async function () {
  const btn = this;
  btn.disabled = true;
  btn.textContent = 'Готовлю PDF…';

  try {
    // библиотека для PDF, грузим только когда нажали
    await loadScript('https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.2/dist/html2pdf.bundle.min.js');

    // рисуем резюме в настоящем размере A4 (в превью оно уменьшено)
    const box = document.createElement('div');
    box.style.position = 'fixed';
    box.style.left = '-10000px';
    box.style.top = '0';
    box.style.width = '794px';
    box.style.background = '#fff';
    box.innerHTML = buildResumeHtml();
    document.body.appendChild(box);

    // ждём шрифты
    await document.fonts.ready;

    const fileName = (data.name || 'resume').trim().replace(/\s+/g, '_') + '_CV.pdf';

    await window.html2pdf()
      .set({
        margin: 0,
        filename: fileName,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'px', format: [794, 1123], orientation: 'portrait', hotfixes: ['px_scaling'] },
        pagebreak: { mode: ['css', 'legacy'], avoid: ['.ent', 'h2'] }
      })
      .from(box.firstElementChild)
      .outputPdf('blob')
      .then(async function (pdfBlob) {
        if (claudeDownloads) {
          // внутри claude.ai файл сохраняется через окно подтверждения
          await claudeDownloads.save({ filename: fileName, data: pdfBlob });
        } else {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(pdfBlob);
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          link.remove();
        }
      });

    box.remove();
    showToast('PDF скачан');
  } catch (e) {
    console.log(e);
    // если человек сам отменил сохранение — ничего не пишем
    if (!(e && e.code === 'declined')) {
      showToast('Не получилось сделать PDF — попробуйте «Печать / PDF»');
    }
  }

  btn.disabled = false;
  btn.textContent = 'Скачать PDF';
});

document.getElementById('printBtn').addEventListener('click', function () {
  window.print();
});


// ---------- работа с ИИ ----------
// два способа:
// 1) сайт открыт внутри Claude (claude.ai) — ИИ работает через аккаунт Claude, ключ не нужен
// 2) сайт запущен с нашим сервером (npm start) — запросы идут на /api/ai, ключ в .env

// адрес сервера с ИИ
// на GitHub Pages сервера нет — ходим на сервер на Render
// при запуске через npm start сервер тот же, что и сайт
let API_URL = '';
if (location.hostname === 'alizhajloobekov-cmd.github.io') {
  API_URL = 'https://resume-builder-kg.onrender.com/';
}

let aiEnabled = false;
let aiChecked = false;
let claudeAi = null;        // ИИ через claude.ai
let claudeDownloads = null; // скачивание файлов внутри claude.ai

async function checkAi() {
  // способ 1: внутри claude.ai
  if (window.claude && window.claude.use) {
    try {
      claudeAi = await window.claude.use('sample');
      claudeDownloads = await window.claude.use('downloads');
    } catch (e) {
      console.log('claude.ai недоступен', e);
    }
  }

  if (claudeAi) {
    aiEnabled = true;
  } else {
    // способ 2: наш сервер
    try {
      const res = await fetch(API_URL + 'api/health');
      const json = await res.json();
      aiEnabled = json.ai === true;
    } catch (e) {
      aiEnabled = false;
    }
  }

  aiChecked = true;
  renderForm();
  if (!wizard.hidden) openWizard();
}

// картинку в base64 для отправки на сервер
function fileToBase64(file) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onload = function () {
      const result = String(reader.result); // data:image/jpeg;base64,....
      resolve({
        media_type: result.slice(5, result.indexOf(';')),
        data: result.slice(result.indexOf(',') + 1)
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function askAi(prompt, images) {
  // через claude.ai
  if (claudeAi) {
    const options = {};
    if (images && images.length) options.images = images;
    try {
      const result = await claudeAi(prompt, options);
      return result.text;
    } catch (e) {
      if (e && e.code === 'rate_limited') throw new Error('много запросов');
      if (e && e.code === 'not_granted') {
        // человек не разрешил ИИ
        claudeAi = null;
        aiEnabled = false;
        renderForm();
      }
      throw new Error('ошибка ИИ ' + (e && e.code));
    }
  }

  // через наш сервер
  let imagesBase64 = [];
  if (images && images.length) {
    for (let i = 0; i < images.length; i++) {
      imagesBase64.push(await fileToBase64(images[i]));
    }
  }

  const res = await fetch(API_URL + 'api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: prompt, images: imagesBase64 })
  });

  if (res.status === 429) throw new Error('много запросов');
  if (!res.ok) throw new Error('ошибка сервера ' + res.status);

  const json = await res.json();
  return json.text;
}

// кнопка "Улучшить текст с ИИ"
async function improveText(btn) {
  const path = btn.dataset.ai;
  const oldText = getValue(path) || '';

  if (!oldText.trim()) {
    showToast('Сначала напишите черновик — ИИ его улучшит');
    return;
  }

  let what;
  if (path === 'summary') {
    what = 'раздел «О себе» в резюме';
  } else {
    const i = path.split('.')[1];
    what = 'описание опыта на должности «' + data.experience[i].role + '» в компании «' + data.experience[i].company + '»';
  }

  let format = 'каждое достижение с новой строки, без маркеров и тире в начале';
  if (path === 'summary') format = '2–4 предложения одним абзацем';

  const prompt = `Ты редактор резюме. Перепиши ${what} для кандидата на должность «${data.title || 'не указана'}».
Правила: сохрани язык исходного текста; не выдумывай фактов, цифр и компаний, которых нет в тексте; пиши коротко и конкретно, от первого лица без местоимения «я», начинай с глаголов действия; ${format}.
Верни только готовый текст без пояснений и кавычек.

Исходный текст:
${oldText}`;

  btn.disabled = true;
  btn.textContent = 'Переписываю…';

  try {
    const newText = await askAi(prompt);
    setValue(path, newText.trim());
    document.getElementById('field-' + path).value = newText.trim();
    renderResume();
    saveData();
    showToast('Текст обновлён — проверьте и поправьте при необходимости');
  } catch (e) {
    console.log(e);
    showToast('ИИ сейчас недоступен, текст не изменён');
  }

  btn.disabled = false;
  btn.textContent = 'Улучшить текст с ИИ';
}


// ---------- окно "Собрать с ИИ" ----------

const wizard = document.getElementById('wizard');
const wizardStatus = document.getElementById('wizardStatus');
const wizardGoBtn = document.getElementById('wizardGoBtn');

// то, что загрузил пользователь
let wizardPhoto = '';
let oldResumeText = '';
let oldResumeImages = [];
let oldResumeName = '';
let isLoading = false;

function setStatus(text, isError) {
  wizardStatus.textContent = text;
  if (isError) {
    wizardStatus.classList.add('err');
  } else {
    wizardStatus.classList.remove('err');
  }
}

function openWizard() {
  wizard.hidden = false;
  document.getElementById('wizardCity').value = document.getElementById('wizardCity').value || data.city || '';
  document.getElementById('wizardLang').value = data.lang;

  if (aiEnabled) {
    setStatus('');
    wizardGoBtn.disabled = false;
  } else {
    if (!aiChecked) {
      // бесплатный сервер засыпает, первый запуск может занять до минуты
      setStatus('Подключаю ИИ… первый раз может занять до минуты');
    } else {
      setStatus('На этой версии сайта ИИ пока недоступен — заполните резюме вручную', true);
    }
    wizardGoBtn.disabled = true;
  }
}

function closeWizard() {
  if (isLoading) return;
  wizard.hidden = true;
}

document.getElementById('openWizardBtn').addEventListener('click', openWizard);
document.getElementById('wizardSkipBtn').addEventListener('click', closeWizard);

// клик по тёмному фону закрывает окно
wizard.addEventListener('click', function (e) {
  if (e.target === wizard) closeWizard();
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !wizard.hidden) closeWizard();
});

// подгружаем библиотеку только когда она нужна
function loadScript(src) {
  return new Promise(function (resolve, reject) {
    if (document.querySelector('script[src="' + src + '"]')) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// читаем PDF через pdf.js
async function readPdf(file) {
  const pdfUrl = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';
  const workerUrl = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
  await loadScript(pdfUrl);
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

  const pdf = await window.pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;

  let text = '';
  const pages = Math.min(pdf.numPages, 5);
  for (let i = 1; i <= pages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    for (let j = 0; j < content.items.length; j++) {
      text += content.items[j].str + (content.items[j].hasEOL ? '\n' : ' ');
    }
    text += '\n';
  }

  // если текста почти нет — это скан, отправим страницы картинками
  const images = [];
  if (text.replace(/\s/g, '').length < 150) {
    for (let i = 1; i <= Math.min(pdf.numPages, 2); i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.6 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext('2d'), viewport: viewport }).promise;
      const blob = await new Promise(function (resolve) {
        canvas.toBlob(resolve, 'image/jpeg', 0.85);
      });
      images.push(blob);
    }
  }

  return { text: text, images: images };
}

// читаем Word через mammoth
async function readDocx(file) {
  await loadScript('https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js');
  const result = await window.mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return result.value;
}

// выбрали фото в окне
document.getElementById('wizardPhoto').addEventListener('change', async function (e) {
  const file = e.target.files[0];
  if (!file) return;
  try {
    wizardPhoto = await makeSquarePhoto(file);
    document.getElementById('wizardPhotoThumb').style.backgroundImage = 'url(' + wizardPhoto + ')';
    document.getElementById('wizardPhotoName').textContent = file.name;
  } catch (err) {
    setStatus('Не удалось открыть фото — попробуйте JPG или PNG', true);
  }
});

// выбрали старое резюме
document.getElementById('wizardFile').addEventListener('change', async function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const ext = file.name.split('.').pop().toLowerCase();
  const nameEl = document.getElementById('wizardFileName');

  oldResumeText = '';
  oldResumeImages = [];
  oldResumeName = file.name;
  nameEl.textContent = 'Читаю файл…';
  document.getElementById('wizardFileExt').textContent = ext.slice(0, 4).toUpperCase();

  try {
    if (ext === 'pdf') {
      const result = await readPdf(file);
      oldResumeText = result.text;
      oldResumeImages = result.images;
    } else if (ext === 'docx') {
      oldResumeText = await readDocx(file);
    } else if (file.type.startsWith('image/')) {
      oldResumeImages = [file];
    } else {
      oldResumeText = await file.text();
    }
    nameEl.textContent = file.name;
    setStatus('');
  } catch (err) {
    console.log(err);
    oldResumeName = '';
    nameEl.textContent = 'Выбрать файл';
    setStatus('Не удалось прочитать файл. Попробуйте PDF с текстом или .docx', true);
  }
});

// превращаем ответ ИИ в список нужного вида
function cleanList(list, fields) {
  const result = [];
  if (Array.isArray(list)) {
    for (let i = 0; i < list.length; i++) {
      const item = {};
      for (let j = 0; j < fields.length; j++) {
        item[fields[j]] = String(list[i][fields[j]] || '');
      }
      result.push(item);
    }
  }
  // если пусто — оставим один пустой пункт, чтобы было что заполнять
  if (result.length === 0) {
    const empty = {};
    fields.forEach(function (f) { empty[f] = ''; });
    result.push(empty);
  }
  return result;
}

// главная кнопка "Собрать резюме"
wizardGoBtn.addEventListener('click', async function () {
  if (!aiEnabled || isLoading) return;

  const about = document.getElementById('wizardAbout').value.trim();
  const city = document.getElementById('wizardCity').value.trim();
  const lang = document.getElementById('wizardLang').value;

  if (!about && !oldResumeText.trim() && oldResumeImages.length === 0) {
    setStatus('Загрузите старое резюме или расскажите о себе хотя бы в паре предложений', true);
    return;
  }

  let langName = 'русском';
  if (lang === 'ky') langName = 'кыргызском';
  if (lang === 'en') langName = 'английском';

  const inCity = city ? ' в городе ' + city : '';

  let resumeText = oldResumeText.trim().slice(0, 20000);
  if (!resumeText && oldResumeImages.length) resumeText = '(приложено изображением)';
  if (!resumeText) resumeText = '(нет)';

  const prompt = `Ты опытный карьерный консультант и редактор резюме${inCity}.
Составь резюме на ${langName} языке по материалам ниже и предложи 3–4 направления работы для этого человека${inCity}.

Правила для резюме:
- Используй только факты из материалов. Не выдумывай компании, даты, цифры, дипломы и контакты. Если чего-то нет, оставь пустую строку.
- title — желаемая должность, исходя из рассказа человека.
- summary — 2–4 предложения, конкретно, без клише.
- desc у опыта — 2–5 строк, каждое достижение с новой строки (\\n), начинай с глаголов действия, без маркеров.
- Даты в формате ММ.ГГГГ или ГГГГ. Для текущей работы end — пустая строка.
- Опыт от нового к старому. skills — строка через запятую, до 12 навыков.

Правила для jobs: реалистичные должности, на которые человек может претендовать сейчас${inCity}; why — одно предложение, почему подходит, со ссылкой на его опыт; where — какие работодатели или отрасли обычно нанимают на такую роль (без названий конкретных компаний, если не уверен). Пиши jobs на ${langName} языке.

Верни ТОЛЬКО JSON такой формы, без markdown:
{"name":"","title":"","email":"","phone":"","city":"","link":"","summary":"","experience":[{"role":"","company":"","start":"","end":"","desc":""}],"education":[{"school":"","degree":"","start":"","end":""}],"skills":"","languages":[{"name":"","level":""}],"jobs":[{"title":"","why":"","where":""}]}

=== Старое резюме ${oldResumeName ? '(' + oldResumeName + ')' : ''} ===
${resumeText}

=== Рассказ человека о себе ===
${about.slice(0, 6000) || '(нет)'}
${city ? '\nГород: ' + city : ''}`;

  isLoading = true;
  wizardGoBtn.disabled = true;
  document.getElementById('wizardProgress').hidden = false;
  setStatus('Составляю резюме… обычно до минуты');

  try {
    const answer = await askAi(prompt, oldResumeImages.slice(0, 3));

    // вырезаем JSON из ответа
    const clean = answer.replace(/```json/g, '').replace(/```/g, '');
    const json = JSON.parse(clean.slice(clean.indexOf('{'), clean.lastIndexOf('}') + 1));

    let skills = json.skills || '';
    if (Array.isArray(skills)) skills = skills.join(', ');

    const jobs = [];
    if (Array.isArray(json.jobs)) {
      json.jobs.slice(0, 5).forEach(function (job) {
        if (job.title) {
          jobs.push({ title: String(job.title), why: String(job.why || ''), where: String(job.where || '') });
        }
      });
    }

    data = {
      template: data.template,
      color: data.color,
      lang: lang,
      photo: wizardPhoto || data.photo || '',
      name: String(json.name || ''),
      title: String(json.title || ''),
      email: String(json.email || ''),
      phone: String(json.phone || ''),
      city: String(json.city || city || ''),
      link: String(json.link || ''),
      summary: String(json.summary || ''),
      experience: cleanList(json.experience, ['role', 'company', 'start', 'end', 'desc']),
      education: cleanList(json.education, ['school', 'degree', 'start', 'end']),
      skills: String(skills),
      languages: cleanList(json.languages, ['name', 'level']),
      jobs: jobs
    };

    updateAll();
    isLoading = false;
    closeWizard();
    editor.scrollTop = 0;

    // резюме готово — сразу предлагаем найти работу
    openJobs('', true);
  } catch (err) {
    console.log(err);
    if (err.message === 'много запросов') {
      setStatus('Слишком много запросов — попробуйте через минуту', true);
    } else {
      setStatus('Не получилось собрать резюме. Попробуйте ещё раз', true);
    }
  }

  isLoading = false;
  wizardGoBtn.disabled = false;
  document.getElementById('wizardProgress').hidden = true;
});


// ---------- окно "Найти работу" ----------

// города КР и их номера (area) на hh.kg
const cities = [
  { name: 'Бишкек', hh: '2760', lalafo: 'bishkek' },
  { name: 'Ош', hh: '2796', lalafo: 'osh' },
  { name: 'Джалал-Абад', hh: '2795', lalafo: 'kyrgyzstan' },
  { name: 'Каракол', hh: '2792', lalafo: 'kyrgyzstan' },
  { name: 'Токмок', hh: '2855', lalafo: 'kyrgyzstan' },
  { name: 'Кара-Балта', hh: '2845', lalafo: 'kyrgyzstan' },
  { name: 'Кант', hh: '2844', lalafo: 'kyrgyzstan' },
  { name: 'Нарын', hh: '2794', lalafo: 'kyrgyzstan' },
  { name: 'Талас', hh: '2793', lalafo: 'kyrgyzstan' },
  { name: 'Баткен', hh: '2797', lalafo: 'kyrgyzstan' },
  { name: 'Балыкчы', hh: '2842', lalafo: 'kyrgyzstan' },
  { name: 'Чолпон-Ата', hh: '2858', lalafo: 'kyrgyzstan' },
  { name: 'Узген', hh: '2857', lalafo: 'kyrgyzstan' },
  { name: 'Кара-Суу', hh: '2847', lalafo: 'kyrgyzstan' },
  { name: 'Весь Кыргызстан', hh: '48', lalafo: 'kyrgyzstan' },
  { name: 'Удалённо', hh: '48', lalafo: 'kyrgyzstan', remote: true }
];

const jobsModal = document.getElementById('jobsModal');
const jobQuery = document.getElementById('jobQuery');
const jobCity = document.getElementById('jobCity');

// заполняем список городов
cities.forEach(function (c, i) {
  const option = document.createElement('option');
  option.value = i;
  option.textContent = c.name;
  jobCity.appendChild(option);
});

// подсказки: должности от ИИ + желаемая должность из резюме
function getJobSuggestions() {
  const list = [];
  if (data.title) list.push(data.title);
  if (data.jobs) {
    data.jobs.forEach(function (job) {
      if (job.title && list.indexOf(job.title) === -1) list.push(job.title);
    });
  }
  return list;
}

// ссылки на поиск на каждом сайте
function getPlatforms(query, city) {
  const q = encodeURIComponent(query);
  const cityName = city.remote ? '' : city.name;

  // hh.kg
  let hhLink = 'https://hh.kg/search/vacancy?text=' + q + '&area=' + city.hh;
  if (city.remote) hhLink += '&schedule=remote';

  // lalafo: пробелы заменяются на дефисы — /bishkek/vakansii/q-продавец-консультант
  let lalafoText = query;
  if (city.remote) lalafoText += ' удаленно';
  const lalafoLink = 'https://lalafo.kg/' + city.lalafo + '/vakansii/q-' +
    encodeURIComponent(lalafoText.trim().toLowerCase().replace(/\s+/g, '-'));

  // LinkedIn
  let linkedinLocation = 'Kyrgyzstan';
  if (cityName && cityName !== 'Весь Кыргызстан') linkedinLocation = cityName + ', Kyrgyzstan';
  let linkedinLink = 'https://www.linkedin.com/jobs/search/?keywords=' + q + '&location=' + encodeURIComponent(linkedinLocation);
  if (city.remote) linkedinLink += '&f_WT=2';

  // поиск по всем сайтам сразу через Google
  let googleText = '"' + query + '" вакансия';
  if (cityName && cityName !== 'Весь Кыргызстан') googleText += ' ' + cityName;
  if (city.remote) googleText += ' удаленно';
  googleText += ' site:hh.kg OR site:lalafo.kg OR site:job.kg OR site:headhunter.kg OR site:rabota.kg OR site:bazar.kg OR site:employment.kg OR site:devkg.com';
  const googleLink = 'https://www.google.com/search?q=' + encodeURIComponent(googleText) + '&tbs=qdr:m';

  return [
    { name: 'hh.kg', desc: 'Самая большая база вакансий в Кыргызстане', link: hhLink },
    { name: 'lalafo', desc: 'Объявления о работе, много вакансий без опыта', link: lalafoLink },
    { name: 'LinkedIn', desc: 'Международные компании и удалённая работа', link: linkedinLink },
    { name: 'DevKG', tag: 'IT', desc: 'Вакансии для разработчиков, дизайнеров, тестировщиков', link: 'https://devkg.com/ru/rabota' },
    { name: 'Employment.kg', desc: 'Международные организации, НКО и проекты', link: 'https://employment.kg/vacancies' },
    { name: 'Find-Ish.gov.kg', tag: 'гос', desc: 'Государственный портал вакансий, бесплатно', link: 'https://find-ish.gov.kg' },
    { name: 'Все сайты сразу', desc: 'Свежие объявления за месяц с hh.kg, lalafo, job.kg, rabota.kg, bazar.kg и других', link: googleLink, all: true }
  ];
}

function renderJobPlatforms() {
  let query = jobQuery.value.trim();
  const city = cities[Number(jobCity.value)];

  // подсвечиваем выбранную подсказку
  document.querySelectorAll('#jobChips .chip-btn').forEach(function (chip) {
    chip.classList.toggle('active', chip.textContent === query);
  });

  const box = document.getElementById('jobPlatforms');
  if (!query) {
    box.innerHTML = '<p class="note">Введите должность, чтобы получить ссылки на вакансии.</p>';
    return;
  }

  const platforms = getPlatforms(query, city);
  let html = '';
  platforms.forEach(function (p) {
    html += '<div class="platform' + (p.all ? ' all' : '') + '">';
    html += '<div><b>' + p.name + (p.tag ? '<span class="tag">' + p.tag + '</span>' : '') + '</b>';
    html += '<small>' + p.desc + '</small></div>';
    html += '<a class="btn small' + (p.all ? ' primary' : '') + '" href="' + p.link + '" target="_blank" rel="noopener">Открыть</a>';
    html += '</div>';
  });
  box.innerHTML = html;
}

function openJobs(query, afterBuild) {
  // заголовок
  if (afterBuild) {
    document.getElementById('jobsTitle').textContent = 'Резюме готово! Теперь найдём работу';
    document.getElementById('jobsLead').textContent = 'Проверьте резюме и скачайте PDF. Ниже — поиск вакансий по вашему профилю на сайтах Кыргызстана.';
  } else {
    document.getElementById('jobsTitle').textContent = 'Найти работу в Кыргызстане';
    document.getElementById('jobsLead').textContent = 'Выберите должность и город — откроем поиск вакансий сразу на нескольких сайтах.';
  }

  // подсказки
  const suggestions = getJobSuggestions();
  let chipsHtml = '';
  suggestions.forEach(function (s) {
    chipsHtml += '<button type="button" class="chip-btn">' + escapeHtml(s) + '</button>';
  });
  document.getElementById('jobChips').innerHTML = chipsHtml;

  // должность
  jobQuery.value = query || jobQuery.value || suggestions[0] || '';

  // город из резюме
  let cityIndex = 0;
  for (let i = 0; i < cities.length; i++) {
    if (data.city && data.city.toLowerCase().indexOf(cities[i].name.toLowerCase()) !== -1) {
      cityIndex = i;
    }
  }
  jobCity.value = cityIndex;

  renderJobPlatforms();
  jobsModal.hidden = false;
}

function closeJobs() {
  jobsModal.hidden = true;
}

document.getElementById('openJobsBtn').addEventListener('click', function () {
  openJobs('');
});
document.getElementById('jobsCloseBtn').addEventListener('click', closeJobs);
document.getElementById('jobsPdfBtn').addEventListener('click', function () {
  document.getElementById('downloadBtn').click();
});

jobQuery.addEventListener('input', renderJobPlatforms);
jobCity.addEventListener('change', renderJobPlatforms);

document.getElementById('jobChips').addEventListener('click', function (e) {
  if (e.target.classList.contains('chip-btn')) {
    jobQuery.value = e.target.textContent;
    renderJobPlatforms();
  }
});

jobsModal.addEventListener('click', function (e) {
  if (e.target === jobsModal) closeJobs();
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !jobsModal.hidden) closeJobs();
});


// ---------- старт ----------

updateAll();

// когда шрифты загрузились, пересчитываем размер листа
document.fonts.ready.then(fitSheet);

if (isFirstVisit) {
  openWizard();
}

checkAi();
