import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState } from './app.state';

/**
 * Feature selector
 */
export const selectAppState = createFeatureSelector<AppState>('app');

export const selectUserInfo = createSelector(
    selectAppState,
    (state: AppState) => state.userInfo
);

/**
 * Generic selector - lấy state theo key
 */
export const selectStateByKey = (key: string) => createSelector(
    selectAppState,
    (state: AppState) => state[key]
);

/**
 * Select all state
 */
export const selectAllState = createSelector(
    selectAppState,
    (state: AppState) => state
);