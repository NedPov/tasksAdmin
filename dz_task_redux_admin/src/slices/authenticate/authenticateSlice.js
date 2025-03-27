import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { register, login, logout, refreshToken } from './authenticate';

// получаем пользователя если он уже в системе
const user = JSON.parse(localStorage.getItem('user'));
const isAuthenticated = !!user; //приводим к boolean


// Метод для регистрации
export const registerUser = createAsyncThunk('authenticate/register', async ({ username, password }, { rejectWithValue }) => {
    try {
        // console.log(username);
        // console.log(password);
        return await register(username, password);
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});


// Метод для входа
export const loginUser = createAsyncThunk('authenticate/login', async ({ username, password }, { rejectWithValue }) => {
    try {
        return await login(username, password);
    } catch (error) {
        // console.log(error.response.data);
        return rejectWithValue(error.response.data);
        
    }
});


// Метод для выхода
export const logoutUser = createAsyncThunk('authenticate/logout', async () => {
    return await logout();
});


// Метод для обновления рефреш токена
export const refreshAccessToken = createAsyncThunk('authenticate/refresh', async () => {
    return await refreshToken();
});


// Создание слайса
const authenticateSlice = createSlice({
    name: 'authenticate',
    initialState: {
        user: user || 'user',
        isAuthenticated: isAuthenticated || false,
        status: null,
        error: null,
    },
    reducers: {},
    // Используем экстраредюсер для работы с асинх действиями
    extraReducers: (builder) => {
        builder
            // Кейсы на регистрацию
            .addCase(registerUser.fulfilled, (state, action) => {
                state.status = action.payload;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.error = action.payload.error;
            })
            // Кейсы на вход
            .addCase(loginUser.fulfilled, (state, action) => {
                // Записываем пользователя
                state.user = action.payload;
                // Переключаем состояние аутентификации
                state.isAuthenticated = true;
                // Меняем статус
                state.status = 'Authenticated';
            }) 
            .addCase(loginUser.rejected, (state, action) => {
                state.error = action.payload.error;
            })
            // Кейсы на выход
            .addCase(logoutUser.fulfilled, (state) =>{
                state.user = null;
                state.isAuthenticated = false;
            })
            // Кейсы на обновление токена
            .addCase(refreshAccessToken.fulfilled, (state, action) =>{
                if(action.payload){
                    state.isAuthenticated = true;
                }
            })
    }
});


export default authenticateSlice.reducer;