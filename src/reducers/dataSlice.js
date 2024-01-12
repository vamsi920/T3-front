import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    data: []
}

const dataSlice = createSlice( {
    name: "data",
    initialState,
    reducers: {
        addEntry: (state, action) => {
            state.data.push(action.payload);
        },
        removeEntry: (state, action) => {
            state.data = state.data.filter((entry) => entry.NDC !== action.payload)
        },
        editEntry: (state, action) => {
            state.data = state.data.map((entry) => {
                if (entry.NDC === action.payload.NDC) {
                    return action.payload;
                } else {
                    return entry;
                }
            })
        }
    }
})


export const { addEntry, removeEntry, editEntry } = dataSlice.actions;
export default dataSlice.reducer; 