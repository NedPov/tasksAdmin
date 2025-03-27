import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { fetchTodos, addTodo, editTodoFetch, completedTodo, pinnedTodo, unpinning, deleteTodo } from "./tasks";


// export наших задач с помощью createAsyncThunk
// Получение всех задач
export const loadTasks = createAsyncThunk('tasks/load', async () => {
    return await fetchTodos();
});

// Получение всех задач для пользователей
export const loadTasksForUsers = createAsyncThunk('tasks/loadTasksForUser', async () =>{
    return await fetchTodos();
})

// Добавление задачи
export const addTasks = createAsyncThunk('tasks/add', async ({text, deadline, priority }) => {
    return await addTodo({text, deadline, priority });
});

// Изменение задачи
export const editTasks = createAsyncThunk('tasks/editTasks', (id) => {
    return id;
});
// метод для отмены состояния изменения задачи
export const editTasksFalse = createAsyncThunk('tasks/editTasksFalse', () => {
    return null;
});
// отправка на сервер измененной задачи
export const editTasksFetch = createAsyncThunk('tasks/editTasksFetch', async (text, deadline, priority, taskId) => {
    return await editTodoFetch({ text, deadline, priority, taskId });
});


// Выполение задачи
export const completedTasks = createAsyncThunk('tasks/completedTasks', async (id) => {
    return await completedTodo( id );
});


// Закрепление задачи
export const pinnedTasks = createAsyncThunk('tasks/pinnedTasks', async (id) => {
    return await pinnedTodo( id );
});
// Открепление задачи
export const unpinningTasks = createAsyncThunk('tasks/unpinningTasks', async (id) =>{
    return await unpinning(id);
});


// Удаление задачи
export const deleteTasks = createAsyncThunk('tasks/deleteTasks', async (id) => {
    return await deleteTodo( id );
});


const initialState = {
    tasks: [],
    error: '',
    message: '',
    taskId: '',
    editTasks: null,
};

// Слайс
const tasksSlice = createSlice({
    name: "tasks",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Получение всех задач
            .addCase(loadTasks.fulfilled, (state, action) => {
                state.tasks = action.payload;
            })
            .addCase(loadTasks.rejected, (state, action) => {
                state.error = action.payload;
            })
            // Добавление задачи
            .addCase(addTasks.fulfilled, (state, action) => {
                state.tasks.push(action.payload);
            })
            .addCase(addTasks.rejected, (state, action) => {
                state.error = action.payload;
            })
            // Изменение задачи
            .addCase(editTasks.fulfilled, (state, action) =>{
                state.taskId = action.payload;
                state.editTasks = true;
            })
            // метод для отмены состояния изменения задачи
            .addCase(editTasksFalse.fulfilled, (state, action) => {
                state.editTasks = action.payload;
            })
            // отправка на сервер измененной задачи
            .addCase(editTasksFetch.fulfilled, (state, action) => {
                // Не знаю почему так, но это путь таски -_-
                const responseTask = action.payload.taskEdit.text.text;
                // ищем задачу по id в массиве тасок (state)
                const task = state.tasks.find(task => task.id == responseTask.taskId); // == потому что мы получаем json(string), а сравниваем id(number)
                // если нашли, меняем значения таски
                if(task){
                    task.text = responseTask.text;
                    task.deadline = responseTask.deadline;
                    task.priority = responseTask.priority;
                }
                
            })
            .addCase(editTasksFetch.rejected, (state, action) => {
                state.error = action.payload;
            })
            // Выполение задачи
            .addCase(completedTasks.fulfilled, (state, action) => {
                const task = state.tasks.find(task => task.id == action.payload); // == потому что мы получаем json(string), а сравниваем id(number)
                if(task){task.completed = !task.completed};
            })
            .addCase(completedTasks.rejected, (state, action) => {
                state.error = action.payload;
            })
            // Закрепление задачи
            .addCase(pinnedTasks.fulfilled, (state, action) => {
                state.message = action.payload.message;
                   // ищем задачу по id в массиве тасок (state)
                const task = state.tasks.find(task => task.id == action.payload.taskId);
                // если нашли, меняем значения таски
                if(task){
                    task.username = action.payload.username
                };
            })
            .addCase(pinnedTasks.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(unpinningTasks.fulfilled, (state, action) =>{
                  // ищем задачу по id в массиве тасок (state)
                const task = state.tasks.find(task => task.id == action.payload.taskId);
                // если нашли, меняем значения таски
                if(task){
                    task.username = null;
                    task.user_id = null;
                }
            })
            .addCase(unpinningTasks.rejected, (state, action) => {
                state.error = action.payload;
            })
            // Удаление задачи
            .addCase(deleteTasks.fulfilled, (state, action) => {
                state.tasks = state.tasks.filter(task => task.id !== action.payload);
            })
            .addCase(deleteTasks.rejected, (state, action) => {
                state.error = action.payload;
            })
    },
});


export default tasksSlice.reducer;




