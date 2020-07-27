import * as kv from "easy-keyvalues";
import * as path from "path";
import { KeyValues } from "easy-keyvalues";
// import { fs } from "vortex-api";
import { existsSync, copyFileSync } from "fs";

export async function readGameInfoFile(filePath: string): Promise<any> {
    try {
        var backupFileName = filePath + '.orig';
        if (!existsSync(backupFileName)) {
            copyFileSync(filePath, backupFileName);
        }
    } catch {}
    var gameInfo = await kv.loadFromFile(filePath);
    return gameInfo;
}

export async function addGames(gameInfo: KeyValues[], games: string[]): Promise<kv.KeyValues[]> {
    var existingPaths = (((
        gameInfo[0].Value as kv.KeyValues[])
            .find(kv => kv.Key == 'FileSystem').Value as kv.KeyValues[])
                .find(kv => kv.Key == 'SearchPaths').Value as kv.KeyValues[]);
    if (!existingPaths || existingPaths.length == 0) {
        throw new Error("Could not read existing search paths to update!");
    } 
    for (const game of games) {
        if (!existingPaths.some(p => p.Value == game)) {
            existingPaths.push(kv.NewKeyValues('Game', game));
        }
    }
    return gameInfo;
}

export async function writeGameInfoFile(filePath: string, gameInfo: KeyValues[]): Promise<void> {
    return kv.writeFile(filePath, gameInfo);
}
