import * as React from 'react';
import { connect } from 'react-redux';
import * as Redux from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { withTranslation } from 'react-i18next';
import { Toggle, log, ComponentEx, More, util } from 'vortex-api';
import { changeDefaultMode, enableSearchPathsUpdate } from './settings';
import { IState, IProfile } from 'vortex-api/lib/types/api';
import { InstallMode } from '.';
const { HelpBlock, FormGroup, ControlLabel, InputGroup, FormControl } = require('react-bootstrap');

interface IConnectedProps {
    defaultMode: InstallMode;
    enablePathsUpdate: boolean;
}

interface IActionProps {
    onChangedDefaultMode: (mode: InstallMode) => void;
    onEnablePathsUpdate: (enable: boolean) => void;
}

type IProps = IConnectedProps & IActionProps;

class SfmSettings extends ComponentEx<IProps, {}> {
    
    public render(): JSX.Element {
        const { t, defaultMode, enablePathsUpdate, onEnablePathsUpdate } = this.props;
        return (
            <form>
                <FormGroup>
                    <ControlLabel>
                        {t('Default SFM installation mode')}
                        <More id="more-sfm-mode" name={t('SFM Install Mode')}>
                            {t(this.getHelpText())}
                        </More>
                    </ControlLabel>
                    <FormControl
                        componentClass='select'
                        onChange={this.selectChannel}
                        value={defaultMode}
                    >
                        <option value='merged'>{t('Merged')}</option>
                        <option value='isolated'>{t('Isolated')}</option>
                    </FormControl>
                    <HelpBlock>
                        Remember you can always change the install mode of individual mods using the Mod Type dropdown in the mod's details.
                    </HelpBlock>
                </FormGroup>
                <FormGroup>
                    <ControlLabel>
                        {t('Automatic search paths configuration')}
                        <More id='more-sfm-searchpaths' name={t('Automatic Search Paths')}>
                            {t(this.getPathsHelpText())}
                        </More>
                    </ControlLabel>
                    <Toggle
                        checked={enablePathsUpdate}
                        onToggle={onEnablePathsUpdate}
                    >
                        {t("Enable paths update on deploy")}
                    </Toggle>
                </FormGroup>
            </form>
        );
    }

    private selectChannel = (evt) => {
        const target: HTMLSelectElement = evt.target as HTMLSelectElement;
        if (['merged', 'isolated'].indexOf(target.value) !== -1) {
            var newMode = ['merged', 'isolated'].find(m => m.toLowerCase() == target.value.toLowerCase()) as InstallMode;
            log('debug', 'changing sfm install mode', {newMode});
            this.props.onChangedDefaultMode(newMode);
        } else {
          log('error', 'invalid sfm install mode', target.value);
        }
      }

    private getHelpText = (): string => {
        return "When you install an SFM mod, it can either be installed to a 'vortex' folder or a separate folder for each mod in your 'usermod' folder.\n\nIf you choose Merged mode (the 'vortex' folder) SFM will see all of your Vortex-managed games as a single mod. If you choose Isolated mode (the 'usermod' folder) SFM will see every mod you install as a separate mod.\n\nThis does not change how Vortex manages your mods, only where they are installed."
    }

    private getPathsHelpText = (): string => {
        return "By default, you need to enable the search paths for Vortex-managed mods just like you would any other mod you have installed: by enabling them in the SFM SDK.\n\nIf you enable automatic updates below, Vortex will attempt to automatically update these paths whenever you deploy your mods.\nThis is especially useful for mods installed in Isolated mode as they must be individually enabled!";
    }

}


function mapStateToProps(state: IState): IConnectedProps {
    // log('debug', 'mapping beatvortex state to props');
    return {
        defaultMode: util.getSafe(state.settings, ['vortex-sfm', 'defaultMode'], 'merged'),
        enablePathsUpdate: util.getSafe(state.settings, ['vortex-sfm', 'updatePaths'], false)
    };
}

function mapDispatchToProps(dispatch: ThunkDispatch<any, null, Redux.Action>): IActionProps {
    // log('debug', 'mapping beatvortex dispatch to props', {ownProps});
    return {
        onChangedDefaultMode: (mode: string) => {
            return dispatch(changeDefaultMode(mode));
        },
        onEnablePathsUpdate: (enable: boolean) => {
            return dispatch(enableSearchPathsUpdate(enable));
        }
    }
}

export default
    withTranslation(['vortex-sfm', 'common'])(connect(mapStateToProps, mapDispatchToProps)(SfmSettings));
