const db = require("../models");

async function getRoleModulesActions(roleId) {
  const [rows] = await db.sequelize.query(
    `
    SELECT 
      m.id AS module_id,
      m.code AS module_code,
      m.title AS module_title,
      a.id AS action_id,
      a.code AS action_code,
      a.title AS action_title
    FROM role_permissions rp
    JOIN permissions p ON rp.permission_id = p.id
    JOIN modules m ON p.module_id = m.id
    JOIN actions a ON p.action_id = a.id
    WHERE rp.role_id = :roleId
    ORDER BY m.id, a.id
    `,
    {
      replacements: { roleId }
    }
  );

  const modulesMap = {};
  rows.forEach(r => {
    if (!modulesMap[r.module_id]) {
      modulesMap[r.module_id] = {
        id: r.module_id,
        code: r.module_code,
        title: r.module_title,
        actions: []
      };
    }
    modulesMap[r.module_id].actions.push({
      id: r.action_id,
      code: r.action_code,
      title: r.action_title
    });
  });

  return Object.values(modulesMap);
}

async function roleHasPermission(roleId, moduleCode, actionCode) {
  const [rows] = await db.sequelize.query(
    `
    SELECT 1
    FROM role_permissions rp
    JOIN permissions p ON rp.permission_id = p.id
    JOIN modules m ON p.module_id = m.id
    JOIN actions a ON p.action_id = a.id
    WHERE rp.role_id = :roleId
      AND m.code = :moduleCode
      AND a.code = :actionCode
    LIMIT 1
    `,
    {
      replacements: { roleId, moduleCode, actionCode }
    }
  );
  return rows.length > 0;
}

module.exports = { getRoleModulesActions, roleHasPermission };
