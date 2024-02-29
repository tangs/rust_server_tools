import fs from 'node:fs';

console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");

const [rootPath] = process.argv.splice(2);
console.log(`root path: ${rootPath}`);

const configTomlPath = `${rootPath}/config.toml`;
const libRsPath = `${rootPath}/game_library/src/lib.rs`;
const configRsPath = `${rootPath}/game_server/src/config.rs`;
const mysqlModPath = `${rootPath}/game_server/src/database/mysql/mod.rs`;
const gameServicePath = `${rootPath}/game_server/src/game_service/mod.rs`;
const lotteryControlFlushTimerPath = `${rootPath}/game_server/src/timer/lottery_control_flush_timer.rs`;
const staticDefPath = `${rootPath}/game_server/src/static_def.rs`;
const timerModPath = `${rootPath}/game_server/src/timer/mod.rs`;

console.log(`config.toml path: ${configTomlPath}`);
console.log(`lib.rs path: ${libRsPath}`);
console.log(`config.rs path: ${configRsPath}`);
console.log(`mysql/mod.rs path: ${mysqlModPath}`);
console.log(`game_service/mod.rs path: ${gameServicePath}`);
console.log(`lottery_control_flush_timer.rs path: ${lotteryControlFlushTimerPath}`);
console.log(`static_def.rs path: ${staticDefPath}`);
console.log(`timer/mod.rs path: ${timerModPath}`);
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

const updateConfigToml = () => {
    console.log("start update config.toml");
    const fileContent = fs.readFileSync(configTomlPath).toString();

    if (fileContent.indexOf("lottery_control_flush_time") != -1) {
        console.log("skip update config.toml\n")
        return false;
    }

    const index = fileContent.indexOf("robot_spin_max_time");
    if (index == -1) {
        console.error("update config.toml faile, can't find robot_spin_max_time field.\n");
        return false;
    }

    const nextNewLine = fileContent.indexOf("\n", index);
    const insertIndex = nextNewLine == -1 ? fileContent.length : nextNewLine;
    const newContent = insertString(fileContent, insertIndex, "\n# 彩金控制模式加载时间(秒)\nlottery_control_flush_time = 30");

    fs.writeFileSync(configTomlPath, newContent);
    console.log("update config.toml success.\n");
    return true;
}

const updateLibRs = () => {
    console.log("start update lib.rs");
    const fileContent = fs.readFileSync(libRsPath).toString();

    if (fileContent.indexOf("set_lottery_control") != -1) {
        console.log("skip update lib.rs\n")
        return false;
    }

    const index = fileContent.indexOf("\n    /// 生成一个用户上下文");
    if (index == -1) {
        console.error("can't find key word.\n");
    }

    const newContent = insertString(fileContent, index, `
    /// 设置彩金控制模式
    #[inline]
    pub fn set_lottery_control(&mut self, mode: i32) {
        self.logic.as_mut().SetLotteryControl(mode);
    }\n`)

    fs.writeFileSync(libRsPath, newContent);
    console.log("update lib.rs success.\n");
    return true;
}

const updateConfigRs = () => {
    console.log("start update conifg.rs");
    const fileContent = fs.readFileSync(configRsPath).toString();

    if (fileContent.indexOf("lottery_control_flush_time") != -1) {
        console.log("skip update conifg.rs\n")
        return false;
    }

    const index = fileContent.indexOf("pub robot_spin_max_time: u32,");
    if (index == -1) {
        console.error("update config.rs faile, can't find keyword.\n");
        return false;
    }
    const nextNewLine = fileContent.indexOf("\n", index);
    console.assert(nextNewLine != -1);

    let newContent = insertString(fileContent, nextNewLine, `
    /// 彩金控制模式加载时间(秒)
    #[serde(default = "default_lottery_control_flush_time")]
    pub lottery_control_flush_time: i32,`);

    const nextScopeIndex = newContent.indexOf("}", nextNewLine);
    console.assert(nextScopeIndex != -1);

    newContent = insertString(newContent, nextScopeIndex + 2, `
/// 默认彩金控制值
fn default_lottery_control_flush_time() -> i32 {
    30
}\n`);

    fs.writeFileSync(configRsPath, newContent);
    console.log("update conifg.rs success.\n");
    return true;
}

const updateMysqlModRs = () => {
    const fileName = "mysql/mod.rs"
    const path = mysqlModPath

    console.log(`start update ${fileName}`);
    const fileContent = fs.readFileSync(path).toString();

    if (fileContent.indexOf("load_lottery_control_mode") != -1) {
        console.log(`skip update ${fileName}\n`)
        return false;
    }

    const index = fileContent.lastIndexOf("}");
    console.assert(index != -1);

    const newContent = insertString(fileContent, index, `
    /// 加载彩金控制模式
    #[inline]
    pub async fn load_lottery_control_mode(&self, service_id: u32) -> Result<i32> {
        Ok(sqlx::query_as::<_, (i32,)>(
            "select \`lottery_control_mode\` from \`game_slots_config\` where \`service_id\`=?",
        )
        .bind(service_id)
        .fetch_optional(&self.game_main)
        .await?
        .map_or(0, |x| x.0))
    }\n`);

    fs.writeFileSync(path, newContent);
    console.log(`update ${fileName} success.\n`);
    return true;
}

const updateGameServiceModRs = () => {
    const fileName = "game_service/mod.rs"
    const path = gameServicePath

    console.log(`start update ${fileName}`);
    const fileContent = fs.readFileSync(path).toString();

    if (fileContent.indexOf("set_lottery_control") != -1) {
        console.log(`skip update ${fileName}\n`)
        return false;
    }

    let index = fileContent.indexOf("    /// 普通旋转\n    #[inline]\n    fn normal_spin");
    console.assert(index != -1);
    let newContent = insertString(fileContent, index, `    /// 设置彩金控制模式
    #[inline]
    fn set_lottery_control(&mut self, mode: i32) -> Result<()> {
        self.logic
            .as_mut()
            .context("logic is none")?
            .set_lottery_control(mode);
        Ok(())
    }\n\n`);

    index = newContent.indexOf("    /// 普通旋转\n    async fn normal_spin");
    console.assert(index != -1);
    newContent = insertString(newContent, index, `    /// 设置彩金控制模式
    async fn set_lottery_control(&self, mode: i32) -> Result<()>;\n`);

    index = newContent.indexOf("    #[inline]\n    async fn normal_spin");
    console.assert(index != -1);
    newContent = insertString(newContent, index, `    #[inline]
    async fn set_lottery_control(&self, mode: i32) -> Result<()> {
        self.inner_call(|inner| async move { inner.get_mut().set_lottery_control(mode) })
            .await
    }\n\n`);

    fs.writeFileSync(path, newContent);
    console.log(`update ${fileName} success.\n`);
    return true;
}

const updateLotteryControlFlushTimerRs = () => {
    const fileName = "lottery_control_flush_timer.rs"
    const path = lotteryControlFlushTimerPath

    if (fs.existsSync(path)) {
        console.log(`skip update ${fileName}\n`)
        return false;
    }

    const newContent = `use crate::game_service::ISymbolService;
use ns_game::static_def::BASE_CONFIG;
use ns_game::timer::Timer;

use crate::static_def::{CONFIG, DATABASE, GAME_SERVICE};

/// 清理peer超时删除
pub struct LotteryControlFlushTimer;

#[async_trait::async_trait]
impl Timer for LotteryControlFlushTimer {
    /// 每10秒检查一次
    #[inline]
    async fn init(&self) -> anyhow::Result<(bool, u64)> {
        Ok((true, (CONFIG.game.lottery_control_flush_time * 1000) as u64))
    }

    #[inline]
    async fn run(&self) -> anyhow::Result<()> {
        let mode = DATABASE
            .load_lottery_control_mode(BASE_CONFIG.base.server_id)
            .await?;
        GAME_SERVICE.set_lottery_control(mode).await?;
        log::trace!("load load_lottery_control_mode:{mode}");
        Ok(())
    }
}
`

    fs.writeFileSync(path, newContent);
    console.log(`update ${fileName} success.\n`);
    return true;
}

const updateStaticDefRs = () => {
    const fileName = "static_def/mod.rs"
    const path = staticDefPath

    console.log(`start update ${fileName}`);
    const fileContent = fs.readFileSync(path).toString();

    if (fileContent.indexOf("LotteryControlFlushTimer") != -1) {
        console.log(`skip update ${fileName}\n`)
        return false;
    }

    let newContent = fileContent.replace(
        "use crate::timer::{CleanPeerTimer, RobotTimer, SyncLotteryTimer, TotalPlayerTimer};",
`use crate::timer::{
    CleanPeerTimer, LotteryControlFlushTimer, RobotTimer, SyncLotteryTimer, TotalPlayerTimer,
};`);

    newContent = newContent.replace(
        "Box::new(TotalPlayerTimer) as Box<dyn Timer>",
        "Box::new(TotalPlayerTimer) as Box<dyn Timer>,\n        Box::new(LotteryControlFlushTimer) as Box<dyn Timer>"
    );

    fs.writeFileSync(path, newContent);
    console.log(`update ${fileName} success.\n`);
    return true;
}

const timerModRs = () => {
    const fileName = "timer/mod.rs"
    const path = timerModPath

    console.log(`start update ${fileName}`);
    const fileContent = fs.readFileSync(path).toString();

    if (fileContent.indexOf("lottery_control_flush_timer") != -1) {
        console.log(`skip update ${fileName}\n`)
        return false;
    }

    let newContent = fileContent.replace(
        "mod clean_peer_timer",
        "mod clean_peer_timer;\nmod lottery_control_flush_timer"
    );

    newContent = newContent.replace(
        "pub use clean_peer_timer::*",
        "pub use clean_peer_timer::*;\npub use lottery_control_flush_timer::*"
    );

    fs.writeFileSync(path, newContent);
    console.log(`update ${fileName} success.\n`);
    return true;
}

let allSuccess = true;

allSuccess &&= updateConfigToml();
allSuccess &&= updateLibRs();
allSuccess &&= updateConfigRs();
allSuccess &&= updateMysqlModRs();
allSuccess &&= updateGameServiceModRs();
allSuccess &&= updateLotteryControlFlushTimerRs();
allSuccess &&= updateStaticDefRs();
allSuccess &&= timerModRs();

console.log(`deal job end, is all success: ${allSuccess}.`)
console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
