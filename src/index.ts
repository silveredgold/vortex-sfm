/**
 * Big thanks to agc93 who helped out with getting this updated/fixed/unfucked and told me how to do it properly, mostly.
 * Parts of the code in this extension is adapted with permission from their extensions under the terms of the MIT license.
 */
import { fs, log, util, selectors } from "vortex-api";
import path = require('path');
import { IExtensionContext, IDiscoveryResult, ProgressDelegate, IExtensionApi, IGameStoreEntry, IMod, IDeployedFile, IGame, IInstruction, IProfile, ISupportedResult, IDialogResult } from 'vortex-api/lib/types/api';
import { isActiveGame } from "vortex-ext-common";
import * as semver from "semver";

import { settingsReducer } from "./settings";
import SfmSettings from "./SfmSettings";
import { readGameInfoFile, addGames, writeGameInfoFile } from "./paths";
import messages from './messages.json';

const GAME_ID = 'sfm'
const STEAMAPP_ID = 1840;
// const I18N_NAMESPACE = 'game-sourcefilmmaker';
let GAME_PATH = '';

const types = ['materials', 'models', 'maps', 'media', 'scripts', 'settings', 'sound'];
export type InstallMode = 'merged'|'isolated';


export function findGame() {
    return util.GameStoreHelper.findByAppId(STEAMAPP_ID.toString())
        .then((game: IGameStoreEntry) => game.gamePath);
}

//This is the main function Vortex will run when detecting the game extension. 
function main(context: IExtensionContext) {
    function getGamePath(game: IGame, useMerged: boolean) {
        const discovery = context.api.getState().settings.gameMode.discovered[game.id];
        var gamePath = path.join(discovery.path, 'game');
        return useMerged ? path.join(gamePath, 'vortex') : gamePath;
    }
    function isManaged(api: IExtensionApi): boolean {
        var profiles: {[profileId: string]: IProfile} = {};
        profiles = util.getSafe(api.getState().persistent, ['profiles'], {});
        const gameProfiles: string[] = Object.keys(profiles)
            .filter((id: string) => profiles[id].gameId === GAME_ID);
        return gameProfiles && gameProfiles.length > 0;
    }
    context.registerMigration((oldVersion) => {
        const extVersion = '0.1.0'
        if (semver.gte(oldVersion, extVersion)) {
            return Promise.resolve();
        }
        const state = context.api.store.getState();
        const mods = util.getSafe(state, ['persistent', 'mods', GAME_ID], {});
        const hasMods = Object.keys(mods).length > 0;
        if (!isManaged(context.api) || !hasMods) {
            return Promise.resolve();
        } else {
            return new Promise((resolve) => {
                var id = sendUpdateNotification(context.api, () => {
                    context.api.dismissNotification(id);
                    resolve();
                });
            });
        }   
    })
    context.once(() => {
        context.api.onAsync('did-deploy', 
            async (profileId, newDeployment: { [modType: string]: IDeployedFile[] }): Promise<void> => {
                if (isActiveGame(context.api, GAME_ID)) {
                    var enabled = util.getSafe(context.api.getState().settings, ['vortex-sfm', 'updatePaths'], false);
                    if (enabled) {
                        //path updates are enabled
                        var paths = ['vortex'];
                        if (newDeployment['sfm-usermod'] && newDeployment['sfm-usermod'].length > 0) {
                            //we have some isolated mods being deployed
                            var mods = util.getSafe(context.api.getState().persistent, ['mods', GAME_ID], {} as { [modId: string]: IMod; });
                            var isolatedMods = [...new Set(newDeployment['sfm-usermod'].map(f => mods[f.source]))];
                            if (isolatedMods && isolatedMods.length > 0) {
                                //we matched up deployed mod files to an installed mod
                                var modNames = isolatedMods.map(m => m.id);
                                paths = paths.concat(modNames);
                            }
                        }
                        log('debug', 'enabling search paths for detected mods', {paths});
                        var discoveryPath = (context.api.getState().settings.gameMode.discovered[GAME_ID]).path;
                        var infoPath = path.join(discoveryPath, 'game', 'usermod', 'gameinfo.txt');
                        var info = await readGameInfoFile(infoPath);
                        info = await addGames(info, paths);
                        await writeGameInfoFile(infoPath, info);
                        return Promise.resolve();
                    } else {
                        log('debug', 'automatic path updates disabled. skipping!');
                    }
                }
            } 
        );
        
    });
    context.registerGame({
        id: GAME_ID,
        name: 'Source Filmmaker',
        mergeMods: true,
        queryPath: findGame,
        supportedTools: tools,
        queryModPath: () => 'game',
        logo: 'gameart.png',
        executable: () => 'game/sfm.exe',
        requiredFiles: [
            'game/sfm.exe',
            'game/usermod/gameinfo.txt'
        ],
        setup: prepareForModding,
        environment: {
            SteamAPPId: STEAMAPP_ID.toString(),
        },
        details: {
            steamAppId: STEAMAPP_ID
        },
    });

    context.registerModType('sfm-vortex', 100, 
        gameId => gameId === GAME_ID, 
        (g) => getGamePath(g, true), 
        (inst) => testModType(context.api, inst, 'merged'),
        {name: 'Merged', mergeMods: true});
    context.registerModType('sfm-usermod', 101,
        gameId => gameId === GAME_ID,
        (g) => getGamePath(g, false),
        (inst) => testModType(context.api, inst, 'isolated'),
        {name: 'Isolated', mergeMods: false});
    
    context.registerInstaller(
        'sfm-content',
        25,
        (files, gameId) => testSupportedContent(files, gameId),
        (files, destination, gameId, progress) => installContent(context.api, files, destination, gameId, progress));

    context.registerReducer(['settings', 'vortex-sfm'], settingsReducer);
    context.registerSettings('Mods', SfmSettings, () => {t: context.api.translate}, () => isManaged(context.api), 100);

    return true;
}

export function testModType(api: IExtensionApi, instructions: IInstruction[], mode: InstallMode): Promise<boolean> {
    var currentDefault = util.getSafe<InstallMode>(api.getState().settings, ['vortex-sfm', 'defaultMode'], 'merged');
    var valid = testFiles(instructions.map(i => i.source));
    return Promise.resolve(valid && currentDefault == mode);
}

const tools = [
    {
        id: 'sfm-sdk',
        name: 'SFM SDK',
        shortName: 'SDK',
        executable: () => path.join('game', 'bin', 'qsdklauncher.exe'),
        requiredFiles: [
            path.join('game', 'bin', 'qsdklauncher.exe'),
            path.join('game', 'sfm.exe')
        ],
        relative: true,
        shell: false,
        exclusive: true
    }
];

async function prepareForModding(discovery: IDiscoveryResult) {
    let vortexPath = path.join(discovery.path, 'game', 'vortex');
    let userPath = path.join(discovery.path, 'game', 'usermod');
    GAME_PATH = path.join(discovery.path, 'game');
    await fs.ensureDirWritableAsync(vortexPath);
    await fs.ensureDirWritableAsync(userPath);
    // ↘ this was stolen wholesale from agc93/beatvortex, but seems to work
    // is there a better way to handle multiple paths?
    return fs.ensureDirWritableAsync(vortexPath, () => fs.ensureDirWritableAsync(userPath, () => Promise.resolve()));
}

function testSupportedContent(files: string[], gameId: string): Promise<ISupportedResult> {
    let supported = (gameId === GAME_ID) &&
        (files.some(f => types.some(t => path.dirname(f).toLowerCase().indexOf(t) !== -1)));
    log('debug', `tested ${files.length} files for sfm installer`, {supported});
    return Promise.resolve({
        supported,
        requiredFiles: [],
    });
}

function installContent(api: IExtensionApi, files: string[], destinationPath: string, gameId: string, progressDelegate: ProgressDelegate) {
    /**
     * bringing the API in here isn't actually necessary, but a) all the other extensions do it and b) we might want it later?
     */
    //basically need to keep descending until I find [maps/materials/media/models/scripts/settings/sound]
    let firstType = path.dirname(files.find(f => types.some(t => path.dirname(f).toLowerCase().indexOf(t) !== -1)));
    let root = path.dirname(firstType);
    //firstType is the first primitive we found (i.e. maps or whatever)
    //root is that directory's parent, which might include more than one primitive
    const filtered = files.filter(file => (((root == "." ? true : (file.indexOf(root) !== -1)) && (!file.endsWith(path.sep)))));
    log('debug', 'filtered non-rooted files', { root: root, candidates: filtered });
    const instructions = filtered.map(file => {
        // log('debug', 'mapping file to instruction', { file: file, root: root });
        const destination = file.substr(firstType.indexOf(path.basename(firstType)));
        return {
            type: 'copy',
            source: file,
            // I don't think ⬇ conditional is needed, but frankly it works now and I'm afraid to touch it.
            destination: `${root == "." ? file : destination}`
        }
    });
    return Promise.resolve({ instructions });
}

export function testFiles(files: string[]): boolean {
    return files.some(f => types.some(t => path.dirname(f).toLowerCase().indexOf(t) !== -1));
}

function sendUpdateNotification(api: IExtensionApi, cb: () => void): string {
    return api.sendNotification({
        type: 'warning',
        title: 'SFM Support extension updated!',
        message: 'The latest version of SFM Support includes some important changes',
        noDismiss: true,
        actions: [
            {
                title: 'See More',
                action: (dismiss) => {
                    api.showDialog('info', 'SFM Support for Vortex', {
                        bbcode: messages.UpgradeNotification ,
                    }, [
                        { label: 'Close'},
                    ]).then((res: IDialogResult) => {
                        dismiss();
                        cb?.();
                    });
                },
            }
        ]
    })
}

module.exports = {
    default: main,
};
