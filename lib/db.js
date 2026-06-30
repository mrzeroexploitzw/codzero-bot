const fs = require("fs-extra");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
fs.ensureDirSync(DATA_DIR);

const FILES = {
  groups: path.join(DATA_DIR, "groups.json"),
  warnings: path.join(DATA_DIR, "warnings.json"),
  users: path.join(DATA_DIR, "users.json"),
  spam: path.join(DATA_DIR, "spam.json")
};

function load(file) {
  try {
    if (!fs.existsSync(file)) return {};
    return fs.readJsonSync(file);
  } catch (e) {
    return {};
  }
}

function save(file, data) {
  fs.writeJsonSync(file, data, { spaces: 2 });
}

function getGroupSettings(groupId) {
  const all = load(FILES.groups);
  if (!all[groupId]) {
    all[groupId] = {
      antilink: false,
      antispam: false,
      welcome: true,
      bye: true,
      welcomeMsg: null,
      byeMsg: null,
      lockGroup: false,
      desc: null
    };
    save(FILES.groups, all);
  }
  return all[groupId];
}

function setGroupSetting(groupId, key, value) {
  const all = load(FILES.groups);
  if (!all[groupId]) all[groupId] = getGroupSettings(groupId);
  all[groupId][key] = value;
  save(FILES.groups, all);
  return all[groupId];
}

function addWarning(groupId, userId) {
  const all = load(FILES.warnings);
  const key = `${groupId}:${userId}`;
  all[key] = (all[key] || 0) + 1;
  save(FILES.warnings, all);
  return all[key];
}

function resetWarnings(groupId, userId) {
  const all = load(FILES.warnings);
  const key = `${groupId}:${userId}`;
  delete all[key];
  save(FILES.warnings, all);
}

function getWarnings(groupId, userId) {
  const all = load(FILES.warnings);
  return all[`${groupId}:${userId}`] || 0;
}

function getSpamRecord(groupId, userId) {
  const all = load(FILES.spam);
  return all[`${groupId}:${userId}`] || { timestamps: [], mutedUntil: 0 };
}

function setSpamRecord(groupId, userId, record) {
  const all = load(FILES.spam);
  all[`${groupId}:${userId}`] = record;
  save(FILES.spam, all);
}

module.exports = {
  getGroupSettings,
  setGroupSetting,
  addWarning,
  resetWarnings,
  getWarnings,
  getSpamRecord,
  setSpamRecord
};
