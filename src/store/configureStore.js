import { configureStore } from '@reduxjs/toolkit';
// import { reducer } from '../reducers/index';
import dataReducer from '../reducers/dataSlice'

export const store = configureStore({
    reducer: {
        data: dataReducer
    }
})


