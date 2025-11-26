import { createReducer, on } from '@ngrx/store';
import { AppState, initialState } from './app.state';
import * as AppActions from './app.action';

export const appReducer = createReducer(
    initialState,
    
    // Set user info
    on(AppActions.setUserInfo, (state, { userInfo }) => ({
        ...state,
        userInfo
    })),
    
    // Clear all state
    on(AppActions.clearState, () => initialState)
);