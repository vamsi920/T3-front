const initialState = {
    data: []
}

export const reducer = (state = initialState, action)=> {
    switch (action.type) {
        case "ADD_ENTRY":
            return {
                ...state,
                data: [...state.data, action.payload]
            }
        case "REMOVE_ENTRY":
            return {
                ...state,
                data: state.data.filter((entry) => entry.NDC !== action.payload)
            }
        // case "EDIT_ENTRY":
        //     return {
        //         ...state,
        //         data: state.data.map((entry) => {
        //             if (entry.NDC === action.payload.NDC) {
        //                 return action.payload;
        //             } else {
        //                 return entry;
        //             }
        //         })
        //     }
        default:
            return state;
    }

}