import fs from 'node:fs';

console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");

const [rootPath] = process.argv.splice(2);
// const rootPath = '/Users/tangs/Documents/slots_server_rust/game_216';
console.log(`root path: ${rootPath}`);

const cargoPath = `${rootPath}/game_server/Cargo.toml`;

console.log(`cargoPath: ${cargoPath}`);
console.log();

/**
 * 
 * @param {string} oldString 
 * @param {number} index 
 * @param {string} insertString 
 * @returns {string}
 */
const insertString = (oldString, index, insertString) => {
    let newContent = oldString.substring(0, index) + insertString;
    if (index < oldString.length) {
        newContent += oldString.substring(index);
    }
    return newContent;
}

/**
 * 
 * @param {string} path 
 * @param {string} fileName 
 * @returns 
 */
const updateRs = (path, fileName) => {
    // const fileName = "game_slots_levels.rs"
    // const path = gameSlotsLevelsPath

    console.log(`start update ${fileName}`);
    let fileContent = fs.readFileSync(path).toString();

    if (fileContent.indexOf('ns_game = "0.1.41"') != -1) {
        console.log(`skip update ${fileName}\n`)
        return false;
    }

    fileContent = fileContent.replace(/ns_game = "\d+\.\d+\.\d+"/, 'ns_game = "0.1.41"')

    fs.writeFileSync(path, fileContent);
    console.log(`update ${fileName} success.\n`);
    return true;
}


let allSuccess = true;

allSuccess &&= updateRs(cargoPath, 'Cargo.toml');

console.log(`deal job end, is all success: ${allSuccess}.`)
console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

// return allSuccess ? 0 : 1
