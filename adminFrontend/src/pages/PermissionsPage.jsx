// adminFrontend/src/pages/PermissionsPage.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { can } from "../utils/permission";

function Icon({ name, className = "" }) {
  const common = `inline-block align-middle ${className}`;
  switch (name) {
    case "pencil":
      return (
        <svg
          className={common}
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 21v-3.75L17.81 2.69a2.12 2.12 0 0 1 3 0l.5.5a2.12 2.12 0 0 1 0 3L6.5 20.75H3z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.5 5.5L18.5 9.5"
          />
        </svg>
      );
    case "trash":
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
        >
          <path
            d="M3 6h18"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8 6V4h8v2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 11v6M14 11v6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "plus":
      return (
        <svg
          className={common}
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
        >
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "spinner":
      return (
        <svg
          className={`animate-spin ${common}`}
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            strokeOpacity="0.2"
          />
          <path
            d="M22 12a10 10 0 0 1-10 10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

function ConfirmModal({
  open,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative z-70 w-full max-w-xs bg-white rounded-lg shadow-lg p-4">
        <div className="mb-2">
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="text-sm text-gray-600 mb-4">{message}</div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1 rounded border text-sm bg-gray-50 hover:bg-gray-100"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-3 py-1 rounded bg-emerald-600 text-white text-sm hover:bg-emerald-700"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState([]);
  const [modules, setModules] = useState([]);
  const [actions, setActions] = useState([]);

  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    from: 0,
    to: 0,
  });
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ module_id: "", action_id: "", label: "" });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [confirmAction, setConfirmAction] = useState(null);
  const searchTimerRef = useRef(null);

  const fetchModules = useCallback(async () => {
    try {
      const res = await api.get("/modules");
      const json = await res.json();
      if (json.status === 1) setModules(json.data || []);
    } catch {
      // silent
    }
  }, []);

  const fetchActions = useCallback(async () => {
    try {
      const res = await api.get("/actions");
      const json = await res.json();
      if (json.status === 1) setActions(json.data || []);
    } catch {
      // silent
    }
  }, []);

  const fetchPermissions = useCallback(
    async (opts = {}) => {
      const qPage = opts.page ?? page;
      const qLimit = opts.limit ?? limit;
      const qSearch =
        typeof opts.search !== "undefined" ? opts.search : search;

      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: qPage,
          limit: qLimit,
          search: qSearch || "",
        });
        const res = await api.get(`/permissions?${params.toString()}`);
        const json = await res.json();
        if (json.status === 1) {
          const list = json.data || [];
          setPermissions(list);

          const fallbackMeta = {
            total: list.length,
            page: qPage,
            limit: qLimit,
            totalPages: 1,
            from: list.length ? 1 : 0,
            to: list.length,
          };

          setMeta(json.meta || fallbackMeta);
          setPage(qPage);
          setLimit(qLimit);
        } else {
          toast.error(json.message || "Failed to load permissions");
        }
      } catch {
        toast.error("Network error while fetching permissions");
      } finally {
        setLoading(false);
      }
    },
    [page, limit, search]
  );

  useEffect(() => {
    fetchModules();
    fetchActions();
    fetchPermissions({ page: 1, limit: 10 });
  }, [fetchModules, fetchActions, fetchPermissions]);

  function onSearchChange(e) {
    const v = e.target.value;
    setSearch(v);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      fetchPermissions({ page: 1, limit, search: v });
      searchTimerRef.current = null;
    }, 400);
  }

  const onLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10) || 10;
    setLimit(newLimit);
    fetchPermissions({ page: 1, limit: newLimit, search });
  };

  const goToPage = (p) => {
    if (p < 1 || p > (meta.totalPages || 1)) return;
    fetchPermissions({ page: p, limit, search });
  };
  const prev = () => goToPage(page - 1);
  const next = () => goToPage(page + 1);

  const getPageNumbers = () => {
    const total = meta.totalPages || 1;
    const current = page;
    const delta = 2;
    let left = Math.max(1, current - delta);
    let right = Math.min(total, current + delta);

    if (current - left < delta)
      right = Math.min(total, right + (delta - (current - left)));
    if (right - current < delta)
      left = Math.max(1, left - (delta - (right - current)));

    const arr = [];
    for (let i = left; i <= right; i++) arr.push(i);
    return arr;
  };

  function setFormField(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function openAdd() {
    if (!can("permissions", "create")) {
      toast.error("You do not have permission to create permissions");
      return;
    }
    setEditingId(null);
    setForm({ module_id: "", action_id: "", label: "" });
    setShowModal(true);
  }

  async function openEdit(p) {
    if (!can("permissions", "edit")) {
      toast.error("You do not have permission to edit permissions");
      return;
    }
    setEditingId(p.id);
    setForm({
      module_id: String(p.module_id),
      action_id: String(p.action_id),
      label: p.label || "",
    });
    setShowModal(true);
  }

  function computedPermissionKey() {
    const mod = modules.find((m) => m.id == form.module_id);
    const act = actions.find((a) => a.id == form.action_id);
    if (!mod || !act) return "";
    return `${mod.code}.${act.code}`;
  }

  async function handleSave(e) {
    e.preventDefault();

    if (!form.module_id || !form.action_id) {
      toast.error("Module and Action are required");
      return;
    }

    if (editingId && !can("permissions", "edit")) {
      toast.error("You do not have permission to update permissions");
      return;
    }
    if (!editingId && !can("permissions", "create")) {
      toast.error("You do not have permission to create permissions");
      return;
    }

    const payload = {
      module_id: Number(form.module_id),
      action_id: Number(form.action_id),
      label: form.label || computedPermissionKey(),
    };

    setSaving(true);
    try {
      let res;
      if (editingId) {
        res = await api.put(`/permissions/${editingId}`, payload);
      } else {
        res = await api.post(`/permissions`, payload);
      }

      const json = await res.json();
      if (json.status !== 1) {
        toast.error(json.message || "Save failed");
        return;
      }

      toast.success(editingId ? "Permission updated" : "Permission created");
      setShowModal(false);
      setEditingId(null);
      fetchPermissions({ page: 1, limit, search: "" });
    } catch {
      toast.error("Failed to save permission");
    } finally {
      setSaving(false);
    }
  }

  async function doDelete(p) {
    if (!can("permissions", "delete")) {
      toast.error("You do not have permission to delete permissions");
      return;
    }
    try {
      const res = await api.del(`/permissions/${p.id}`);
      const json = await res.json();
      if (json.status !== 1) {
        toast.error(json.message || "Delete failed");
        return;
      }
      toast.success("Permission deleted");
      fetchPermissions({ page: 1, limit, search: "" });
    } catch {
      toast.error("Failed to delete permission");
    }
  }

  return (
    <div className="p-6 mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Permissions</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage module × action permissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Show</label>
            <select
              value={limit}
              onChange={onLimitChange}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <input
            value={search}
            onChange={onSearchChange}
            placeholder="Search..."
            className="border rounded px-3 py-2 w-64"
          />

          {can("permissions", "create") && (
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded shadow"
            >
              <Icon name="plus" /> Add Permission
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  Module
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  Key
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  Label
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    <Icon name="spinner" />{" "}
                    <span className="ml-2">Loading…</span>
                  </td>
                </tr>
              ) : permissions.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No permissions available
                  </td>
                </tr>
              ) : (
                permissions.map((p, i) => (
                  <tr key={p.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {(meta.from || 0) + i}
                    </td>
                    <td className="px-4 py-3">{p.module?.title}</td>
                    <td className="px-4 py-3">{p.action?.title}</td>
                    <td className="px-4 py-3">{p.permission_key}</td>
                    <td className="px-4 py-3">{p.label}</td>
                    <td className="px-4 py-3">
                      <div className="inline-flex gap-2">
                        {can("permissions", "edit") && (
                          <button
                            onClick={() => openEdit(p)}
                            className="px-2 py-1 border rounded text-sm bg-white hover:bg-gray-50"
                          >
                            <Icon name="pencil" />
                          </button>
                        )}
                        {can("permissions", "delete") && (
                          <button
                            onClick={() =>
                              setConfirmAction({
                                type: "delete",
                                permission: p,
                              })
                            }
                            className="px-2 py-1 border rounded text-sm bg-white hover:bg-gray-50 text-red-600"
                          >
                            <Icon name="trash" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER / PAGINATION */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            Showing {meta.from || 0} to {meta.to || 0} of {meta.total || 0}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(1)}
              disabled={page === 1}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              «
            </button>
            <button
              onClick={prev}
              disabled={page === 1}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              ‹
            </button>
            {getPageNumbers().map((pNum) => (
              <button
                key={pNum}
                onClick={() => goToPage(pNum)}
                className={`px-3 py-1 border rounded ${
                  pNum === page ? "bg-emerald-600 text-white" : "bg-white"
                }`}
              >
                {pNum}
              </button>
            ))}
            <button
              onClick={next}
              disabled={page === meta.totalPages || meta.totalPages === 0}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              ›
            </button>
            <button
              onClick={() => goToPage(meta.totalPages || 1)}
              disabled={page === meta.totalPages || meta.totalPages === 0}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              »
            </button>
          </div>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-16">
          <div
            className="fixed inset-0 bg-black opacity-40"
            onClick={() => {
              setShowModal(false);
              setEditingId(null);
            }}
          />
          <form
            onSubmit={handleSave}
            className="relative z-60 bg-white rounded-lg shadow-xl w-full max-w-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingId ? "Edit Permission" : "Add Permission"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                }}
                className="text-gray-500"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Module
                </label>
                <select
                  value={form.module_id}
                  onChange={(e) => setFormField("module_id", e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">-- select --</option>
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action
                </label>
                <select
                  value={form.action_id}
                  onChange={(e) => setFormField("action_id", e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">-- select --</option>
                  {actions.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key
                </label>
                <input
                  value={computedPermissionKey()}
                  readOnly
                  className="w-full border rounded px-3 py-2 bg-gray-50"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Label
                </label>
                <input
                  value={form.label}
                  onChange={(e) => setFormField("label", e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <div />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingId(null);
                  }}
                  className="px-4 py-2 bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-600 text-white rounded"
                >
                  {saving ? <Icon name="spinner" /> : editingId ? "Update" : "Save"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      <ConfirmModal
        open={!!confirmAction}
        title="Delete Permission"
        message="Delete this permission? This cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => {
          if (!confirmAction) return;
          doDelete(confirmAction.permission);
          setConfirmAction(null);
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
