export interface AppState {
    
    // User info
    userInfo: any | null;
    
    [key: string]: any;
}

/**
 * Initial state
 */
export const initialState: AppState = {
    userInfo: null
};