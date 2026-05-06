# MTG Makaroff Tuning — CRM System

CRM-система для автосервиса: клиенты, заказ-наряды, прайс-лист, календарь, зарплаты, финансы.

## Технологии

- **Backend:** Node.js + Express
- **Frontend:** React + Vite + Tailwind CSS + shadcn/ui
- **Данные:** In-memory (хранятся пока сервер запущен)

---

## Быстрый запуск (на своём сервере / VPS)

### 1. Требования

- **Node.js 18+** (скачать: https://nodejs.org)
- **npm** (идёт с Node.js)

### 2. Установка

```bash
# Распакуйте архив
unzip mtg-crm.zip
cd mtg-crm

# Установите зависимости
npm install

# Соберите проект
npm run build
```

### 3. Запуск

```bash
# Запуск в production-режиме
NODE_ENV=production node dist/index.cjs
```

Сервер запустится на порту **5000**. Откройте в браузере:
```
http://localhost:5000
```

Для запуска в фоне (чтобы не закрывался при выходе из терминала):
```bash
# Через pm2 (рекомендуется)
npm install -g pm2
pm2 start dist/index.cjs --name mtg-crm
pm2 save
pm2 startup   # чтобы запускался при перезагрузке сервера

# Или через nohup
nohup node dist/index.cjs &
```

### 4. Доступ с телефона

Если сервер запущен на вашем компьютере в локальной сети:
```
http://192.168.x.x:5000
```
(замените на IP вашего компьютера)

Если сервер на VPS с доменом:
```
http://ваш-домен.ru:5000
```

---

## Размещение на хостинге

### Вариант 1: Render.com (бесплатный план)

1. Создайте аккаунт на https://render.com
2. Создайте **New Web Service**
3. Загрузите код через GitHub или вручную
4. Настройки:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `NODE_ENV=production node dist/index.cjs`
   - **Environment:** `Node`
5. Нажмите Deploy

### Вариант 2: Railway.app

1. Создайте аккаунт на https://railway.app
2. New Project → Deploy from GitHub (или загрузите ZIP)
3. Railway автоматически определит Node.js проект
4. Добавьте переменную `PORT=5000`

### Вариант 3: VPS (DigitalOcean, Timeweb, Beget и др.)

```bash
# Подключитесь к серверу
ssh user@your-server-ip

# Установите Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Загрузите и распакуйте проект
# (через scp, FileZilla, или git)

cd mtg-crm
npm install
npm run build

# Запуск через pm2
npm install -g pm2
pm2 start dist/index.cjs --name mtg-crm
pm2 save
pm2 startup
```

Для HTTPS настройте Nginx как reverse proxy:
```nginx
server {
    listen 80;
    server_name your-domain.ru;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Разделы CRM

| Раздел | Описание |
|--------|----------|
| **Дашборд** | Общая статистика: клиенты, заказы, доход/расход |
| **Клиенты** | База клиентов с авто и контактами |
| **Календарь** | Записи на работы, фото осмотра |
| **Заказ-наряды** | Создание нарядов, добавление услуг из прайса, печать |
| **Финансы** | Доходы и расходы, баланс |
| **Зарплаты** | Расчёт ЗП: мастера — фикс, менеджеры — фикс + % от заказов |
| **Услуги** | Прайс-лист по категориям (PPF, детейлинг, тонировка и т.д.) |
| **Сотрудники** | Управление штатом, роли, зарплаты, бонусные проценты |
| **Рассылка** | Внутренние сообщения клиентам |

---

## Важно

- Данные хранятся в оперативной памяти сервера. При перезапуске сервера данные сбрасываются к начальным.
- Для постоянного хранения данных в будущем можно подключить PostgreSQL.
- Порт по умолчанию: 5000. Можно изменить через переменную окружения `PORT`.
