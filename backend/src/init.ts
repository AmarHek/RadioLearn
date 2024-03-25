import * as Path from "path";
import * as fs from "fs";
import {TemplateDB, UserDB, MaterialDB} from "./models";
import {dataPathConfig} from "./config";

export function initData() {
    console.log("Initializing directories if not already there...");
    initDirectories();
    console.log("...finished");

    console.log("Loading default data into MongoDB if not already there...");
    loadDefaultMongoDB().then(() => console.log("...finished"));
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

async function loadDefaultMongoDB() {
    // This function is intended for the first startup of the backend, namely for the MongoDB
    // It will assert the contents of the following collections: material, template, user, participant

    // If the collection does not exist, we will create it and add the default data from the corresponding json file
    // If the collection exists, but is empty, we will also add the default data from the corresponding json file
    // Finally, if the collection is not empty, we will assert that all fields are present and add them otherwise

    try {
        let collections: string[];
        if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "docker") {
            collections = ["templates", "users", "material", "participants"]
        } else {
            collections = ["templates", "users", "material"];
        }

        for (const collection of collections) {
            const jsonData = fs.readFileSync(Path.join(__dirname, "..", "init", "development", collection + ".json"),
                'utf8');
            const data = JSON.parse(jsonData);

            let keys: string[] = [];
            let existingKeys: string[] = [];

            if (collection === "templates") {
                keys = data.map((entry: any) => entry.name);
                const existingData = await TemplateDB.find({name: {$in: keys}}).exec();
                existingKeys = existingData.map((entry) => entry.name);
            } else if (collection === "users") {
                keys = data.map((entry: any) => entry.username);
                const existingData = await UserDB.find({username: {$in: keys}}).exec();
                existingKeys = existingData.map((entry) => entry.username);
            } else if (collection === "material") {
                keys = data.map((entry: any) => entry.scans.id);
                const existingData = await MaterialDB.find({"scans.id": {$in: keys}}).exec();
                existingKeys = existingData.map((entry) => entry.scans.id);
            } else {
                console.log("Unknown collection");
            }

            // using keys and existingKeys, we can now assert which keys are missing
            const missingKeys = keys.filter((key) => !existingKeys.includes(key));

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
