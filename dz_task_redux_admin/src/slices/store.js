import { configureStore } from "@reduxjs/toolkit";

import tasksSlice from './tasks/tasksSlice';
import authenticateSlice from './authenticate/authenticateSlice';


export default configureStore({
    reducer: {
        tasks: tasksSlice,
        authenticate: authenticateSlice,
    },
});






