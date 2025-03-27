// ! Работаем с MySQL

// НАСТРОЙКА
// ============================================================================================

// Подключаем файл конфигурации
require('dotenv').config();

// Подключаем основные пакеты
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Подключаем пакеты для работы с токенами/паролем
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Инициализируем приложение
const app = express();

// Обозначаем порт сервера (Обращаемся к файлу .env)
const PORT = process.env.PORT || 5000;
console.log(process.env.PORT);

// Обходим политику cors
app.use(cors({ origin: 'http://localhost:3001', credentials: true }));
// express работает с json
app.use(express.json());
// Работаем с куки
app.use(cookieParser());



// АДМИНКА
const loginAdmin = process.env.LOGIN_ADMIN || 'admin';
const passAdmin = process.env.PASS_ADMIN || 'password';

// ============================================================================================



// РАБОТА С БД
// ============================================================================================

// Создаем данные для подключение к MySQL  
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    dateStrings: true, //нужен для того что бы дата с mysql нормально отоббражалась в input type:datetime-local
});


// Подключение к MySQL
db.connect(err => {
    // Обработка ошибки
    if (err) return console.error('Ошибка подключения к MySQL', err);
    console.log('Подключено к MySQL');


    // Создаем БД
    db.query(`create database if not exists ${process.env.DB_NAME || 'dz_todo_redux_error'}`, (err) => {
        if (err) return console.error('Ошибка создания БД', err);
        console.log("БД успешно создана");
    });


    // Переключаемся на нашу БД
    db.changeUser({ database: process.env.DB_NAME || 'dz_todo_redux' }, (err) => {
        // Обработка ошибки
        if (err) return console.error('Ошибка выбора БД', err);


        //Переменная для создания таблицы РОЛЕЙ
        const createTableRoles = 'create table if not exists roles(id int auto_increment primary key, role varchar(255) unique)';

        // создание таблицы РОЛЕЙ в выбраной БД
        db.query(createTableRoles, (err) => {
            if (err) return console.error('Ошбика создания таблицы ролей', err);
            console.log('Таблица ролей готова к использованию');
        });

        // Добавляем сразу роли admin и user
        db.query('insert ignore into roles(role) values ("admin")');
        db.query('insert ignore into roles(role) values ("user")');



        // Переменная для создания таблицы ПОЛЬЗОВАТЕЛЕЙ
        const createTableUsers = 'create table if not exists users(id int auto_increment primary key, username varchar(255) not null unique, password varchar(255) not null, role_id int, foreign key (role_id) references roles(id))';

        // Создание таблицы ПОЛЬЗОВАТЕЛЕЙ в выбраной БД
        db.query(createTableUsers, (err) => {
            // Обработка ответа
            if (err) return console.error('Ошибка создания таблицы пользователей', err);
            console.log('Таблицы пользователей готова к использованию')
        });


        // Переменная для создания таблицы ЗАДАЧ
        const createTableTodos = 'create table if not exists todos(id int auto_increment primary key, text varchar(255) not null, deadline datetime, priority varchar(255), completed boolean default false, user_id int default null, foreign key (user_id) references users(id))';

        // Создание таблицы ЗАДАЧ в выбраной БД
        db.query(createTableTodos, (err) => {
            if (err) return console.error('Ошибка создания таблицы задач', err);
            console.log('Таблица задач готова к использованию');
        });


        // Переменная для создания РЕФРЕШ-ТОКЕНА
        const createTableRefreshTokens = 'create table if not exists refresh_tokens(id int auto_increment primary key, token text not null unique, user_id int not null, foreign key (user_id) references users(id))';

        // Создание таблицы РЕФРЕШ-ТОКЕНОВ в выбраной БД
        db.query(createTableRefreshTokens, (err) => {
            if (err) return console.error("Ошибка создания таблицы рефреш-токенов", err);
            console.log('Таблица рефреш-токенов готова к использованию');
        });
    });
});

// ============================================================================================



// РАБОТА С ТОКЕНАМИ ДОСТУПА
// ============================================================================================

// Генерация токена доступа
const generateAccessToken = (user) => {
    // Подписываем токен
    const accessToken = jwt.sign({ id: user.id, username: user.username, role: user.role, role_id: user.role_id }, process.env.ACCESS_SECRET, { expiresIn: '15m' });
    return accessToken;
}

// Генерация рефреш-токена
const generateRefreshToken = (user) => {
    // Подписываем токен
    const refreshToken = jwt.sign({ id: user.id, username: user.username, role: user.role, role_id: user.role_id }, process.env.REFRESH_SECRET, { expiresIn: '7d' });

    // Помещаем в таблицу рефреш-токенов
    db.query('insert into refresh_tokens (user_id, token) values (?, ?)', [user.id, refreshToken], (err) => {
        if (err) {
            console.error("Ошибка создания рефреш токена", err);
        } else {
            console.log('Рефреш-токен успешно записан в БД');
        }
    });
    return refreshToken;
};



// ВЕРИФИКАЦИЯ ТОКЕНА ДОСТУПА
const authenticateToken = (req, res, next) => {
    // Получаем токен из заголовка запроса
    const headerAuthToken = req.headers.authorization;
    // С токеном передается еще слово bearer
    const token = headerAuthToken.split(' ')[1];

    // Обработка ошибки
    if (!token) return res.status(403).json({ error: 'Токен не обнаружен. У вас нет доступа' });

    // Проверяем токен
    jwt.verify(token, process.env.ACCESS_SECRET, (err, user) => {
        // Обработка ошибки
        if (err) return res.status(403).json({ error: 'Невалидный токен. У вас нет доступа' });

        req.user = user;

        next();
    });
};



// Обновление токена доступа
app.post('refresh', async (req, res) => {
    // Достаем токен из куки
    const refreshToken = req.cookies.refreshToken;
    // Обработка ошибки
    if (!refreshToken) return res.status(403).json({ error: 'Refresh-token не обнаружен. У вас нет доступа' });

    // Поиск токена в БД
    db.query('select * from refresh_tokens where token=?', [refreshToken], (err, token) => {
        if (err || !token) return res.status(403), json({ error: 'Refresh-токен не найден' });

        // Проверяем токен
        jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, user) => {
            if (err) return res.status(403).json({ error: 'Невалидный Refresh-токен. У вас нет доступа' });

            // Создаем новый токен доступа
            const newAccessToken = generateAccessToken(user);

            // Отправляем обновленный токен и данные пользователя
            res.json({ accessToken: newAccessToken, user: { id: user.id, username: user.username, role: user.role_id } });
        });
    });
});

// ============================================================================================





// РАБОТА С ВХОДОМ/ВЫХОДОМ И РЕГИСТРАЦИЕЙ
// ============================================================================================

// РЕГИСТРАЦИЯ
app.post('/register', async (req, res) => {
    // Получаем данные пользователя из формы, извлекаем их из тела
    const { username, password } = req.body;

    console.log(username);
    console.log(password);
    
    // Хэшируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Роль пользователя
    let roleName = 'user';

    // Если логин и пароль совпали с теми, что мы прописали - меняем роль на админ
    if (loginAdmin == username && passAdmin == password) {
        roleName = 'admin';
    }


    // Получаем id роли, передав ее в запросе
    db.query('select id from roles where role =?', [roleName], (err, role) => {
        // Обработка ошибки
        if (err) return res.status(500).json({ error: err.message, message: 'Не удалось получить роль пользователя' });

        console.log(role);
        console.log(role[0].id);

        // Выполняем добавление в таблицу users
        db.query('insert into users (username, password, role_id) values (?, ?, ?)', [username, hashedPassword, role[0].id], (err) => {
            // Обработка ошибки
            if (err) return res.status(500).json({ error: err.message });

            // Отправляем сообщение в ответе
            res.json({ message: `Пользователь ${username} успешно зарегистрирован` });

        });
    });

});



//  ВХОД
app.post('/login', async (req, res) => {
    // Получаем данные пользователя из формы, извлекаем их из тела
    const { username, password } = req.body;
    console.log(username);
    console.log(password);

    // Поиск пользователя по БД и объединение с ролью
    db.query('select users.*, roles.role from users, roles where users.role_id=roles.id and username=?', [username], async (err, users) => {

        // Т.к. получаем массив
        const user = users[0];
        console.log(user);

        // если вводить неправильные логин/пароль, то ошибка не выпадает, находится массив user, user = undefined
        if (err || user === undefined) {
            console.log('Ошибка');

            return res.status(400).json({ error: "Неверное имя пользователя" });
        } else {
            console.log('Ошибки не обнаружено');

            // Сравнение введеного пароля и хэшированного пароля из БД
            const isPasswordValid = await bcrypt.compare(password, user.password);
            // Обработка ошибки
            if (!isPasswordValid) return res.status(400).json({ error: 'Неверный пароль' });

            // Генерируем токены и передаем данные пользователя
            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);


            // ОТПРАВЛЯЕМ ОТВЕТ
            // Записываем в куки наш рефреш токен
            res.cookie('refreshToken', refreshToken);
            // Передаем токен доступа и информацию о пользователе
            res.json({ accessToken, user: { id: user.id, username: user.username, role: user.role, role_id: user.role_id } });
        }
    });
});



// ВЫХОД И УДАЛЕНИЕ РЕФРЕШ-ТОКЕНА
app.post('/logout', (req, res) => {
    // Достаем токен из куки
    const refreshToken = req.cookies.refreshToken;
    // обработка ошибки
    if (!refreshToken) return res.status(403).json({ error: "Refresh-Токен не обнаружен. У вас нет доступа" });

    // Удаляем из БД
    db.query('delete from refresh_tokens where token = ?', [refreshToken], (err) => {
        // обработка ошибки
        if (err) return res.status(500).json({ error: message });

        // Удаляем токен из куки
        res.clearCookie('refreshToken');
        // Отправляем ответное сообщение
        res.json({ message: 'Refresh-токен удален' });
    });
});

// ============================================================================================





// РАБОТА С ЗАДАЧАМИ
// ============================================================================================
// ! Изменить прием и отправку с todos на tasks

// ПОЛУЧЕНИЕ ЗАДАЧ
app.get('/todos', authenticateToken, (req, res) => {
    db.query('select todos.*, users.username from todos left join users on todos.user_id = users.id', (err, results) => {
        if (err) return res.status(500).json({ error: err.message, message: 'Не получилось получить задачи' });

        res.json(results);
    });
});



// ДОБАВЛЕНИЕ ЗАДАЧИ
app.post('/todos', authenticateToken, (req, res) => {
    // Достаем текст задачки из запроса, из тела
    const { text, deadline, priority } = req.body;

    // Добваляем задачу в БД
    db.query('insert into todos(text, deadline, priority) values (?, ?, ?)', [text, deadline, priority], (err, result) => {
        if (err) return res.status(500).json({ message: 'Не получилось добавить задачу', error: err.message });

        // Отправляем ответ
        res.json({ id: result.insertId, text, deadline, priority });
    });
});



// ИЗМЕНЕНИЕ ЗАДАЧИ
app.put('/todos/:id/edit', authenticateToken, (req, res) => {
    // Извлекаем id задачи из параметров адресной строки
    const { id } = req.params;

    // Извлекаем данные из формы
    const { text, deadline, priority } = req.body;

    // Меняем значения задачи 
    db.query('update todos set text = ?, deadline = ?, priority = ? where id = ?', [text, deadline, priority, id], (err, result) => {
        // обработка ошибки
        if (err) return res.status(500).json({ message: 'Не удалось изменить статус задачи', error: err.message });

        // Отправляем ответ
        res.json({ message: 'Статус задачи изменен', taskEdit: { text, deadline, priority } });
    });
});


// ИЗМЕНЕНИЕ СТАТУСА ЗАДАЧИ выполнено/не выполнено
app.put('/todos/:id/complete', authenticateToken, (req, res) => {
    // Извлекаем id задачи из параметров адресной строки
    const { id } = req.params;

    //  Запрос на изменение статуса выполнения задачи
    db.query('update todos set completed = not completed where id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message, message: 'Не удалось изменить статус задачи' });
        res.json(id);
    });
});



// ЗАКРЕПЛЕНИЕ ПОЛЬЗОВАТЕЛЯ ЗА ЗАДАЧЕЙ
app.put('/todos/:id/pinned', authenticateToken, (req, res) => {
    // Извлекаем id задачи из параметров адресной строки
    const { id } = req.params;
    // Получаем данные пользователя из токена, которым мы проверяем аутентификацию
    const { user } = req.body;

    //  Запрос на изменение статуса присвоения задачи пользователю
    db.query('update todos set user_id = ? where id = ?', [user.id, id], (err) => {
        if (err) return res.status(500).json({ error: err.message, message: 'Не удалось закрепить пользователя за задачей' });

        res.json({ message: `Пользователь ${user.username} взял задачу`, taskId: id, userId: user.id, username: user.username });
    });
});

// ОТКРЕПЛЕНИЕ ПОЛЬЗОВАТЕЛЯ ОТ ЗАДАЧИ
app.put('/todos/:id/unpinning', authenticateToken, (req, res) => {
    // Извлекаем id задачи из параметров адресной строки
    const { id } = req.params;

    //  Запрос на изменение статуса присвоения задачи пользователю
    db.query('update todos set user_id = ? where id = ?', [null, id], (err) => {
        if (err) return res.status(500).json({ error: err.message, message: 'Не удалось открепить пользователя от задачи' });

        res.json({ taskId: id, userId: null, });
    });
});


// УДАЛЕНИЕ ЗАДАЧИ
app.delete('/todos/:id', authenticateToken, (req, res) => {
    // Извлекаем id задачи из параметров адресной строки
    const { id } = req.params;

    // Запрос на удаление
    db.query('delete from todos where id = ?', [id], (err) => {
        // Обработка ошибки
        if (err) return res.status(500).json({ message: "Ошибка удаления задачи" });

        res.json({ message: 'Задача удалена' });
    });
});

// ============================================================================================



// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен по адресу http://localhost:${PORT}`);
});

