import fs from 'node:fs';

console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");

const [rootPath] = process.argv.splice(2);
console.log(`root path: ${rootPath}`);

const gameServiceModPath = `${rootPath}/game_server/src/game_service/mod.rs`;
const roomPath = `${rootPath}/game_server/src/game_service/room.rs`;
const packerPath = `${rootPath}/game_server/src/packer/mod.rs`;
const gameServicePath = `${rootPath}/game_server/src/peer/game_service.rs`;


console.log(`game_service/mod.rs path: ${gameServiceModPath}`);
console.log(`room.rs path: ${roomPath}`);
console.log(`packer/mod.rs path: ${packerPath}`);
console.log(`game_service.rs path: ${gameServicePath}`);
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

const updateGameServiceModRs = () => {
    const fileName = "game_service/mod.rs"
    const path = gameServiceModPath

    console.log(`start update ${fileName}`);
    const fileContent = fs.readFileSync(path).toString();

    if (fileContent.indexOf("get_all_table_players_count") != -1) {
        console.log(`skip update ${fileName}\n`)
        return false;
    }

    let index = fileContent.indexOf("    /// 选出一个空的位置\n    fn get_rand_none_table_seat_index(&self)");
    console.assert(index != -1);
    let newContent = insertString(fileContent, index, 
`    /// 获取每一页的玩家数量
    fn get_all_table_players_count(&self) -> Result<Vec<u32>>;\n`);

    index = newContent.indexOf("    #[inline]\n    fn get_rand_none_table_seat_index(&self)");
    console.assert(index != -1);
    newContent = insertString(newContent, index, 
`    #[inline]
    fn get_all_table_players_count(&self) -> Result<Vec<u32>> {
        unsafe {
            if let Some(ref room) = self.deref_inner().room {
                Ok(room.get_all_table_players_count())
            } else {
                bail!("room is none")
            }
        }
    }\n\n`);

    fs.writeFileSync(path, newContent);
    console.log(`update ${fileName} success.\n`);
    return true;
}

const updateRoomRs = () => {
    const fileName = "room.rs"
    const path = roomPath

    console.log(`start update ${fileName}`);
    const fileContent = fs.readFileSync(path).toString();

    if (fileContent.indexOf("pub fn get_all_table_players_count(&self)") != -1) {
        console.log(`skip update ${fileName}\n`)
        return false;
    }

    let index = fileContent.indexOf("    /// 选出一个空的位置\n    #[inline]\n    pub fn get_rand_none_table_seat_index(&self)");
    console.assert(index != -1);
    let newContent = insertString(fileContent, index, 
`    /// 获取每一页的玩家数量
    #[inline]
    pub fn get_all_table_players_count(&self) -> Vec<u32> {
        self.tables
            .iter()
            .cloned()
            .map(|x| {
                x.seats.iter().fold(0, |i, seat| {
                    i + match seat {
                        SeatInfo::Player { .. } | SeatInfo::Robot { .. } => 1,
                        SeatInfo::None => 0,
                    }
                })
            })
            .collect()
    }\n\n`);

    fs.writeFileSync(path, newContent);
    console.log(`update ${fileName} success.\n`);
    return true;
}

const updatePackerRs = () => {
    const fileName = "packer/mod.rs"
    const path = packerPath

    console.log(`start update ${fileName}`);
    const fileContent = fs.readFileSync(path).toString();

    if (fileContent.indexOf("pub table_seat_players: Vec<u32>") != -1) {
        console.log(`skip update ${fileName}\n`)
        return false;
    }

    let index = fileContent.indexOf("    /// 倍率表\n    pub bet_ratios: &'static [SlotsBetRatios]");
    console.assert(index != -1);
    let newContent = insertString(fileContent, index, 
`    /// 每一页玩家数
    pub table_seat_players: Vec<u32>,\n`);

    fs.writeFileSync(path, newContent);
    console.log(`update ${fileName} success.\n`);
    return true;
}

const updateGameServiceRs = () => {
    const fileName = "game_service.rs"
    const path = gameServicePath

    console.log(`start update ${fileName}`);
    const fileContent = fs.readFileSync(path).toString();

    if (fileContent.indexOf("table_seat_players") != -1) {
        console.log(`skip update ${fileName}\n`)
        return false;
    }

    let index = fileContent.indexOf("        let res = PlayerStatusRet {");
    console.assert(index != -1);
    let newContent = insertString(fileContent, index, 
`\n        let table_seat_players = GAME_SERVICE.get_all_table_players_count()?;\n\n`);

    index = newContent.indexOf("            game_levels: game_slot_level_iter()");
    console.assert(index != -1);
    newContent = insertString(newContent, index, 
`            table_seat_players,\n`);

    fs.writeFileSync(path, newContent);
    console.log(`update ${fileName} success.\n`);
    return true;
}

let allSuccess = true;

allSuccess &&= updateGameServiceModRs();
allSuccess &&= updateRoomRs();
allSuccess &&= updatePackerRs();
allSuccess &&= updateGameServiceRs();

console.log(`deal job end, is all success: ${allSuccess}.`)
console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
