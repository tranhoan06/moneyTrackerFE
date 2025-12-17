import { ActionReducer, MetaReducer } from '@ngrx/store';
import { localStorageSync } from 'ngrx-store-localstorage';

export function localStorageSyncReducer(
  reducer: ActionReducer<any>
): ActionReducer<any> {
  return localStorageSync({
    keys: ['app'], 
    rehydrate: true, 
    storage: sessionStorage,
    storageKeySerializer: (key) => `moneytracker_${key}`,
  })(reducer);
}

export const metaReducers: MetaReducer<any>[] = [localStorageSyncReducer];