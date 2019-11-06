//Import some assets from Vortex we'll need.
const path = require('path');
const { fs, log, util } = require('vortex-api');
const winapi = require('winapi-bindings');

const GAME_ID = 'sfm'
const STEAMAPP_ID = 1840;
let GAME_PATH = '';

const types = ['materials', 'models', 'maps', 'media', 'scripts', 'settings', 'sound']


function main(context) {
    //This is the main function Vortex will run when detecting the game extension. 
    context.registerGame({
        id: GAME_ID,
        name: 'Source Filmmaker',
        mergeMods: false,
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
            gamepath: GAME_PATH
        },
        details: {
            steamAppId: STEAMAPP_ID
        },
    });
    context.registerInstaller('sfm-content', 25, testSupportedContent, installContent);
    return true
}

const tools = [
    {
        id: 'USPU',
        name: 'Usermod Search Paths Updater',
        shortName: 'USPU',
        executable: () => 'uspu.exe',
        requiredFiles: [
            'uspu.exe'
        ],
        parameters: ['enable-all', "."],
        relative: true,
        shell: true,
        exclusive: true
    }
]

function findGame() {
    return util.steam.findByAppId(STEAMAPP_ID.toString())
        .then(game => game.gamePath);
}

function prepareForModding(discovery) {
    let gamePath = path.join(discovery.path, 'game', 'usermod')
    GAME_PATH = gamePath;
    return fs.ensureDirWritableAsync(gamePath, () => Promise.resolve());
}

function testSupportedContent(files, gameId) {
    let supported = (gameId === GAME_ID) &&
        (files.some(f => types.some(t => path.dirname(f).toLowerCase().indexOf(t) !== -1)));
    return Promise.resolve({
        supported,
        requiredFiles: [],
    });
}

function installContent(files, destinationPath, gameId, progressDelegate) {
    // var modName = path.basename(destinationPath).split('.').slice(0, -1).join('.');
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
            destination: root == "." ? file : destination
        }
    });
    return Promise.resolve({ instructions });
}

module.exports = {
    default: main,
};