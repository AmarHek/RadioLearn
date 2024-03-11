import * as Path from "path";
import * as fs from "fs";
import {TemplateDB} from "./models";

export function initData() {
    console.log("Initializing directories...");
    initDirectories();
    console.log("...finished");

    console.log("Loading default Templates into database if not already in database...")
    loadDefaultTemplates().then(() => console.log("...finished"));

}

// on app start, initialize all relative directories for file saving etc.
function initDirectories() {
    if (!fs.existsSync(Path.join(process.cwd(), "data"))) {
        fs.mkdirSync(Path.join(process.cwd(), "data"));
    }
    if (!fs.existsSync(Path.join(process.cwd(), "data/images"))) {
        fs.mkdirSync(Path.join(process.cwd(), "data/images"));
    }
    if (!fs.existsSync(Path.join(process.cwd(), "data/excels"))) {
        fs.mkdirSync(Path.join(process.cwd(), "data/excels"));
    }
    if (!fs.existsSync(Path.join(process.cwd(), "data/json"))) {
        fs.mkdirSync(Path.join(process.cwd(), "data/json"));
    }
}

// load default json files on startup (can be deleted from the database later)
async function loadDefaultTemplates() {
    if (!fs.existsSync(Path.join(__dirname, "./assets/Radiolearn.json"))) {
        console.warn("Radiolearn.json missing!")
    } else {
        // console.log("Removing old Radiolearn");
        // await TemplateDB.deleteOne({name: "Radiolearn"});
        saveTemplate(Path.join(__dirname, "./assets/Radiolearn.json"), "Radiolearn", "deepDoc");
    }

    if (!fs.existsSync(Path.join(__dirname, "./assets/RöntgenNormal.json"))) {
        console.warn("RöntgenNormal.json missing!")
    } else {
        // console.log("Removing old RöntgenNormal");
        // await TemplateDB.deleteOne({name: "RöntgenNormal"});
        saveTemplate(Path.join(__dirname, "./assets/RöntgenNormal.json"), "RöntgenNormal", "deepDoc");
    }

    if (!fs.existsSync(Path.join(__dirname, "./assets/Intensivlunge.json"))) {
        console.warn("RöntgenNormal.json missing!")
    } else {
        // console.log("Removing old Intensivlunge");
        // await TemplateDB.deleteOne({name: "Intensivlunge"});
        saveTemplate(Path.join(__dirname, "./assets/Intensivlunge.json"), "Intensivlunge",
            "shallowDoc");
    }

    if (!fs.existsSync(Path.join(__dirname, "./assets/Zwei-Ebenen-Thorax.json"))) {
        console.warn("RöntgenNormal.json missing!")
    } else {
        // console.log("Removing old Zwei-Ebenen-Thorax");
        // await TemplateDB.deleteOne({name: "Zwei-Ebenen-Thorax"});
        saveTemplate(Path.join(__dirname, "./assets/Zwei-Ebenen-Thorax.json"), "Zwei-Ebenen-Thorax",
            "shallowDoc");
    }
}

async function saveTemplate(path: string, name: string, kind: string) {
    try {
        const count = await TemplateDB.countDocuments({name: name});
        if (count === 0) {
            console.log("Adding " + name + " from assets..");
            const rawData = fs.readFileSync(path, "utf-8");
            const metaData = fs.statSync(path);
            const timestamp = (new Date(metaData.mtime)).getTime();
            const parts = JSON.parse(rawData);
            const template = new TemplateDB({
                parts: parts,
                name: name,
                kind: kind,
                timestamp
            });
            template.save().then(res => {
                console.log("Successfully saved " + res.name);
            });
        }
    } catch (err) {
        console.error(err);
    }
}
