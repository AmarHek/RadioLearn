import * as fs from "fs";
import * as Path from "path";

export function generateUniqueFilename(path: string, name: string, extension: string): string {
    // checks if file already exists in path and adds incremental numbers
    if (fs.existsSync(Path.join(path, name + extension))) {
        let i = 1;
        while (i < 10000) {
            const newName = name + i;
            if (!fs.existsSync(Path.join(path, newName + extension))) {
                return newName + extension;
            } else {
                i = i + 1;
            }
        }
        return name + extension;
    } else {
        return name + extension;
    }
}

export function trimArray(array: string[]): string[] {
    for (let i = 0; i < array.length; i++) {
        array[i] = array[i].trim()
    }
    return array
}

export function trim2DArray(array: string[][]): string[][] {
    for (let i = 0; i < array.length; i++) {
        const sublist = array[i]
        for (let j = 0; j < sublist.length; j++) {
            sublist[j] = sublist[j].trim()
        }
    }
    return array;
}

export function isJsonString(str: string) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

export function isNumber(value: string | number): boolean
{
    return ((value != null) &&
        (value !== '') &&
        !isNaN(Number(value.toString())));
}
