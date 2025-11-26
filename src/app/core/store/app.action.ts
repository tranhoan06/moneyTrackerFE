import { createAction, props } from '@ngrx/store';

export const setUserInfo = createAction(
    '[App] Set User Info',
    props<{ userInfo: any }>()
);

export const clearState = createAction(
    '[App] Clear State'
);