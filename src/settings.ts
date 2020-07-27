import { createAction } from 'redux-act';
import { util, actions } from "vortex-api";
import { IReducerSpec } from 'vortex-api/lib/types/api';
import { InstallMode } from ".";

export const changeDefaultMode =
    createAction('SFM_CHANGE_MODE', (defaultMode: string) => defaultMode);

export const enableSearchPathsUpdate =
    createAction('SFM_UPDATE_PATHS', (enable: boolean) => enable);

export const settingsReducer: IReducerSpec = {
    reducers: {
        [changeDefaultMode as any]: (state, payload: string) => {
            return util.setSafe(state, ['defaultMode'], payload);
        },
        [enableSearchPathsUpdate as any]: (state, payload: boolean) => {
            return util.setSafe(state, ['updatePaths'], payload);
        }
    },
    defaults: {
        defaultMode: 'merged',
        updatePaths: false
    }
};