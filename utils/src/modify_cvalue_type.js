import fs from 'node:fs';

console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");

const [rootPath] = process.argv.splice(2);
console.log(`root path: ${rootPath}`);

const gameSlotsLevelsPath = `${rootPath}/game_server/src/database/mysql/table/game_slots_levels.rs`;
const packerPath = `${rootPath}/game_server/src/packer/mod.rs`;


console.log(`gameSlotsLevelsPath: ${gameSlotsLevelsPath}`);
console.log(`packerPath: ${packerPath}`);
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

    if (fileContent.indexOf("pub c_value: i64") != -1 &&
     fileContent.indexOf("pub c_lottery_value: i64") != -1) {
        console.log(`skip update ${fileName}\n`)
        return false;
    }

    fileContent = fileContent.replace('pub c_value: i32', 'pub c_value: i64')
    fileContent = fileContent.replace('pub c_lottery_value: i32', 'pub c_lottery_value: i64')

    fs.writeFileSync(path, fileContent);
    console.log(`update ${fileName} success.\n`);
    return true;
}


let allSuccess = true;

allSuccess &&= updateRs(gameSlotsLevelsPath, 'game_slots_levels.rs');
allSuccess &&= updateRs(packerPath, 'packer/mod.rs');

console.log(`deal job end, is all success: ${allSuccess}.`)
console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

// return allSuccess ? 0 : 1
