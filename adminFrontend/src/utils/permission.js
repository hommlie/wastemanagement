// adminFrontend/src/utils/permission.js

export function can(moduleCode, actionCode = null) {
  try {
    const raw = localStorage.getItem("access");
    if (!raw) return false;

    const access = JSON.parse(raw);
    const mod = String(moduleCode || "").trim().toLowerCase();
    const act = actionCode ? String(actionCode).trim().toLowerCase() : null;

    // Case 1: ["users.view", "users.create", ...]
    if (Array.isArray(access) && typeof access[0] === "string") {
      if (!act) {
        return access.some((k) =>
          String(k).toLowerCase().startsWith(mod + ".")
        );
      }
      const key = `${mod}.${act}`;
      return access.some((k) => String(k).toLowerCase() === key);
    }

    // Case 2: [{ permission_key: "users.view" }, ...]
    if (Array.isArray(access) && access[0] && access[0].permission_key) {
      if (!act) {
        return access.some((p) =>
          String(p.permission_key || "")
            .toLowerCase()
            .startsWith(mod + ".")
        );
      }
      const key = `${mod}.${act}`;
      return access.some(
        (p) =>
          String(p.permission_key || "").toLowerCase() === key
      );
    }

    // Case 3: [
    //   { id, code: "users", actions: [{ code: "view" }, { code: "create" }, ...] },
    //   ...
    // ]
    if (Array.isArray(access)) {
      const module = access.find(
        (m) => String(m.code || "").trim().toLowerCase() === mod
      );
      if (!module) return false;
      if (!act) return true;
      if (!Array.isArray(module.actions)) return false;
      return module.actions.some(
        (a) =>
          String(a.code || "").trim().toLowerCase() === act
      );
    }

    return false;
  } catch {
    return false;
  }
}
