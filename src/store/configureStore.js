import { configureStore } from '@reduxjs/toolkit';
// import { reducer } from '../reducers/index';
import dataReducer from '../reducers/dataSlice';
import fullDataReducer from '../reducers/fullDataSlice'

export const store = configureStore({
    reducer: {
        data: dataReducer,
        fullData: fullDataReducer
    }
})


