import axios from "axios";

const SERVER_URL = 'http://localhost:9876/todos';

// Настройка axios по дефолту
const api = axios.create({
    baseURL: SERVER_URL,
    headers: {
        "Content-Type": "application/json",
    },
    //работа с куки(headers), отправляем токен
    withCredentials: true
});


// Запрос: Получение всех задач
export const fetchTodos = async () => {
    const response = await api.get('/'); // указали / потому что весь путь уже прописан в api
    return response.data;
};


// Запрос: Добавить задачу
export const addTodo = async ({text, deadline, priority }) => {
    const response = await api.post('/', {text, deadline, priority});
    // console.log(response.data);
    return response.data;
};



// Запрос: Изменение задачи
export const editTodoFetch = async (text, deadline, priority, taskId) => {
    const response = await api.put(`/${taskId}/edit`, { text, deadline, priority });
    return response.data;
};


// Запрос: Выполнено
export const completedTodo = async (id) => {
    const response = await api.put(`/${id}/complete`);
    return response.data;
};


// Запрос: Закрепление задачи за пользователем
export const pinnedTodo = async (id) => {
    const user = JSON.parse(localStorage.getItem('user'));
    // console.log(user);
    const response = await api.put(`/${id}/pinned`, {user});
    return response.data;
};

// Запрос: Открепление задачи от пользователя
export const unpinning = async (id) =>{
    const response = await api.put(`/${id}/unpinning`);
    return response.data;
}


// Запрос: Удаление задачи
export const deleteTodo = async (id) => {
    const response = await api.delete(`/${id}`);
    return id;
};




// interceptors - фишка axios. Перехватывает запросы исходящие и добавляет в них то, что пропишем
api.interceptors.request.use(async (config) => {
    // Автоматом отправляем наш токен со всеми запросами
    let token = localStorage.getItem('accessToken');
    // Настраиваем что в заголовке Authorization будет наш токен доступа
    config.headers.Authorization = `Bearer ${token}`;
    
    return config;
});






