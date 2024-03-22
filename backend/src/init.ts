import * as Path from "path";
import * as fs from "fs";
import {TemplateDB, UserDB, MaterialDB} from "./models";
import {dataPathConfig} from "./config";

export function initData() {
    console.log("Initializing directories...");
    initDirectories();
    console.log("...finished");

    // console.log("Loading default Templates into database if not already in database...")
    // loadDefaultTemplates().then(() => console.log("...finished"));

    console.log("Loading default data into data folder if not already there...");
    loadDefaultData();
    console.log("...finished");

    console.log("Loading default data into MongoDB if not already there...");
    loadDefaultMongoDB().then(() => console.log("...finished"));
    console.log("...finished");
}

// on app start, initialize all relative directories for file saving etc.
function initDirectories() {
    const dataPath: string = dataPathConfig.path;

    // check if data path exists, if not create it
    if (!fs.existsSync(dataPath)) {
        fs.mkdirSync(dataPath);
    }
    // check for other paths
    const paths = ["images", "excels", "json"];
    for (const path of paths) {
        if (!fs.existsSync(Path.join(dataPath, path))) {
            fs.mkdirSync(Path.join(dataPath, path));
        }
    }
}

function loadDefaultData() {
    // This function is intended for the first startup of the backend, namely for the data folder
    // It will assert that all files from the init folder are located in the data folder and copy all missing
    // files to the data folder

    // First let's list all files on the init folder
    const initPath = Path.join(__dirname, "..", "init", "data");
    const dataPath = dataPathConfig.path;

    const missingFiles = [];

    // These are the folders that need checking, so we will iterate
    const folders = ["excels", "images", "json"];
    for (const folder of folders) {
        const initFolder = Path.join(initPath, folder);
        const dataFolder = Path.join(dataPath, folder);
        const files = fs.readdirSync(initFolder);
        for (const file of files) {
            const initFile = Path.join(initFolder, file);
            const dataFile = Path.join(dataFolder, file);
            if (!fs.existsSync(dataFile)) {
                missingFiles.push(initFile);
            }
        }
    }
    console.log("Missing " + missingFiles.length + " files in data folder. Copying now.");
    for (const file of missingFiles) {
        // For the destination, we have to replace the init path with the data path
        const destination = file.replace(initPath, dataPath);
        // Some of the files are folders, so we have to check if the
        fs.cpSync(file, destination, {recursive: true});
    }
}

async function loadDefaultMongoDB() {
    // This function is intended for the first startup of the backend, namely for the MongoDB
    // It will assert the contents of the following collections: material, template, user, participant

    // If the collection does not exist, we will create it and add the default data from the corresponding json file
    // If the collection exists, but is empty, we will also add the default data from the corresponding json file
    // Finally, if the collection is not empty, we will assert that all fields are present and add them otherwise

    try {
        const collections = ["templates", "users", "material"]

        for (const collection of collections) {
            const jsonData = fs.readFileSync(Path.join(process.cwd(), "init", "mongodb", collection + ".json"), 'utf8');
            const data = JSON.parse(jsonData);

            let keys: string[] = [];
            let existingKeys: string[] = [];

            if (collection === "templates") {
                keys = data.map((entry: any) => entry.name);
                const existingData = await TemplateDB.find({name: {$in: keys}}).exec();
                existingKeys = existingData.map((entry: any) => entry.name);
            } else if (collection === "users") {
                keys = data.map((entry: any) => entry.username);
                const existingData = await UserDB.find({username: {$in: keys}}).exec();
                existingKeys = existingData.map((entry: any) => entry.username);
            } else if (collection === "material") {
                keys = data.map((entry: any) => entry.scans.id);
                const existingData = await MaterialDB.find({"scans.id": {$in: keys}}).exec();
                existingKeys = existingData.map((entry: any) => entry.scans.id);
            } else {
                console.error("Collection not found");
            }

            // using keys and existingKeys, we can now assert which keys are missing
            const missingKeys = keys.filter((key: any) => !existingKeys.includes(key));

            for (const entry of data) {
                // We need to remove the _id field, as it is not allowed to be set manually
                deleteIDFields(entry);
                if (collection === "templates") {
                    if (missingKeys.includes(entry.name)) {
                        const template = new TemplateDB(entry);
                        await template.save();
                    }
                } else if (collection === "users") {
                    if (missingKeys.includes(entry.username)) {
                        const user = new UserDB(entry);
                        await user.save();
                    }
                } else if (collection === "material") {
                    if (missingKeys.includes(entry.scans.id)) {
                        const material = new MaterialDB(entry);
                        await material.save();
                    }
                }
            }
        }
    } catch (err) {
        console.error(err);
    }

}

function deleteIDFields(entry: any) {
    // iterate through all fields recursively and check for _id fields, delete if found
    for (const field in entry) {
        if (field === "_id") {
            delete entry[field];
        } else if (typeof entry[field] === "object") {
            deleteIDFields(entry[field]);
        }
    }
}
