import { createAction } from 'redux-act';
import { util, actions } from "vortex-api";
import { IReducerSpec } from 'vortex-api/lib/types/api';
import { InstallMode } from ".";

export const changeDefaultMode =
    createAction('SFM_CHANGE_MODE', (defaultMode: InstallMode) => (defaultMode));

export const settingsReducer: IReducerSpec = {
    reducers: {
        [changeDefaultMode as any]: (state, payload: string) => {
            return util.merge(state, ['defaultMode'], payload);
        }
    },
    defaults: {
        defaultMode: 'merged'
    }
};