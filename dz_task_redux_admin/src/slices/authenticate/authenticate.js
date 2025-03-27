import axios from "axios";

const SERVER_URL = 'http://localhost:9876';


// Настройка axios по дефолту
const api = axios.create({
    baseURL: SERVER_URL,
    headers: {
        "Content-Type": "application/json"
    },
    //работа с куки(headers), отправляем токен
    withCredentials: true
});


// Метод на регистрацию
export const register = async (username, password) => {
    // console.log(username);
    // console.log(password);
    const response = await api.post('/register', { username, password });
    // console.log(response)
    return response.data.message;
};



// Метод на вход
export const login = async (username, password) => {
    const response = await api.post('/login', { username, password });
    // console.log(response)
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    return response.data.user;
};


// Метод на выход
export const logout = async () => {
    await api.post('/logout');

    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
};


// Метод для обновления токена
export const refreshToken = async () => {
    const response = await api.post('/refresh');

    localStorage.setItem('accessToken', response.data.accessToken);
    return response.data;
};


// interceptors - фишка axios. Перехватывает запросы исходящие и добавляет в них то, что пропишем
api.interceptors.request.use(async (config) => {
    // Автоматом отправляем наш токен со всеми запросами
    let token = localStorage.getItem('accessToken');

    // Настраиваем что в заголовке Authorization будет наш токен доступа
    config.headers.Authorization = `Bearer ${token}`;

    return config;
});


