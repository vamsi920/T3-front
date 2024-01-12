import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    fullData: []
}

const fullDataSlice = createSlice( {
    name: "fullData",
    initialState,
    reducers: {
        addFullEntry: (state, action) => {
            state.fullData.push(action.payload);
        }
    }
})

export const {addFullEntry} = fullDataSlice.actions;
export default fullDataSlice.reducer;

