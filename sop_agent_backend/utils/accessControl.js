const SOP = require("../models/SOP");

function isAdmin(user) {
  return user?.role === "admin";
}

async function getAccessibleSopFilter(user) {
  if (isAdmin(user)) {
    return {};
  }

  return {
    uploadedBy: user?._id || null
  };
}

async function getAccessibleSopIds(user) {
  const filter = await getAccessibleSopFilter(user);
  const docs = await SOP.find(filter).select("_id").lean();
  return docs.map((doc) => String(doc._id));
}

async function canAccessSop(user, sopId) {
  if (!sopId) {
    return false;
  }

  const filter = await getAccessibleSopFilter(user);
  const sop = await SOP.findOne({
    ...filter,
    _id: sopId
  }).select("_id");

  return Boolean(sop);
}

module.exports = {
  isAdmin,
  getAccessibleSopFilter,
  getAccessibleSopIds,
  canAccessSop
};
