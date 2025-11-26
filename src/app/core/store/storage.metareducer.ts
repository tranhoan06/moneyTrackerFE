import { ActionReducer, MetaReducer } from '@ngrx/store';
import { localStorageSync } from 'ngrx-store-localstorage';
import { AppState } from './app.state';

/**
 * Meta reducer để sync state với localStorage
 */
export function localStorageSyncReducer(
  reducer: ActionReducer<any>
): ActionReducer<any> {
  return localStorageSync({
    keys: ['app'], // Tên của feature state cần persist
    rehydrate: true, // Load lại state từ localStorage khi khởi động
    storage: sessionStorage, // Hoặc sessionStorage
    storageKeySerializer: (key) => `moneytracker_${key}`,
  })(reducer);
}

export const metaReducers: MetaReducer<any>[] = [localStorageSyncReducer];