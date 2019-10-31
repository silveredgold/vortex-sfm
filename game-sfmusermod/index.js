//Import some assets from Vortex we'll need.
const path = require('path');
const { fs, log, util } = require('vortex-api');
const winapi = require('winapi-bindings');
// const kv = require('./keyvalues')

const GAME_ID = 'sfm'
const STEAMAPP_ID = 1840;
let GAME_PATH = '';

const types = ['materials', 'models', 'maps', 'media', 'scripts', 'settings', 'sound']

function main(context) {
    //This is the main function Vortex will run when detecting the game extension. 
    context.registerGame({
        id: GAME_ID,
        name: 'Source Filmmaker (usermod)',
        mergeMods: true,
        queryPath: findGame,
        supportedTools: [],
        queryModPath: () => 'game/usermod',
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
    context.registerInstaller('sfm-content', 25, testSupportedContent, installContent);
    return true
}

function findGame() {
    return util.steam.findByAppId(STEAMAPP_ID.toString())
        .then(game => game.gamePath);
    // GAME_PATH = gamePath;
    // return GAME_PATH;
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
    var modName = path.basename(destinationPath).split('.').slice(0, -1).join('.');
    // log('debug', 'installing mod', { dest: destinationPath, name: modName });
    //basically need to keep descending until I find [maps/materials/media/models/scripts/settings/sound]
    let root = path.dirname(files.find(f => types.some(t => path.dirname(f).toLowerCase().indexOf(t) !== -1)));
    let parent = path.dirname(root);
    log('debug', 'found mod root', { root: root, parent: parent });
    const instructions = getInstructions(root, parent, files);
    progressDelegate(50);
    // addSearchPath(modName);
    // var obj = kv.decode(fs.readFileSync(filePath, 'utf8'));
    // obj.GameInfo.FileSystem.SearchPaths.push({ "Game": modName})
    // fs.writeFileSync(filePath, kv.encode(obj));
    return Promise.resolve({ instructions });
}

function getInstructions(root, parent, files) {
    if (parent !== '.') {
        const filtered = files.filter(file => ((file.indexOf(root) !== -1) && (!file.endsWith(path.sep))));
        const instructions = filtered.map(file => {
            const destination = file.substr(file.toLowerCase().indexOf(root) + root.length)
            return {
                type: 'copy',
                source: file,
                destination: destination
                // destination: file.replace(root, '')
            }
        });
        return instructions;
    } else {
        const instructions = files.map(file => {
            // const destination = file.substr(file.toLowerCase().indexOf(root) + root.length)
            return {
                type: 'copy',
                source: file,
                destination: file
                // destination: file.replace(root, '')
            }
        });
        return instructions;
    }
}

function addSearchPath(modName) {
    try {
        var filePath = path.join(GAME_PATH, 'gameinfo.txt');
        // fs.copyFile(filePath, path.join(GAME_PATH, 'gameinfo.txt.bak'));
        log('debug', 'attempting to read GameInfo KV file', { file: filePath });
        var lines = fs.readFileSync(filePath, 'utf8').split("\n");
        if (lines.findIndex(l => l.includes(modName)) == -1) {
            var pathsLine = lines.findIndex(l => l.trim() == "\"SearchPaths\"");
            lines.splice(pathsLine + 3, 0, lines[pathsLine + 2].replace("|gameinfo_path|.", modName));
            fs.writeFileSync(filePath, lines.join('\n'))
        } else {
            log('debug', 'mod already found in usermod paths!');
        }
    } catch {
        log('warning', 'errors encountered while attempting to enable the mod. You may need to change usermod search paths to enable your mod!')
    }
}

module.exports = {
    default: main,
};