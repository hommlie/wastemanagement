// adminFrontend/src/pages/ModulesPage.jsx
import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { can } from "../utils/permission";

/* --- Small Icon component --- */
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

/* --- Confirm modal --- */
function ConfirmModal({
  open,
  title = "Confirm",
  message = "Are you sure?",
  confirmText = "Yes",
  cancelText = "No",
  onConfirm = () => {},
  onCancel = () => {},
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative z-70 w-full max-w-xs bg-white rounded-lg shadow-lg p-4">
        <div className="mb-2">
          <h3 className="text-sm font-semibold text-gray-800">
            {title}
          </h3>
        </div>
        <div className="text-sm text-gray-600 mb-4">
          {message}
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1 rounded border text-sm text-gray-700 bg-gray-50 hover:bg-gray-100"
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

/* --- Main ModulesPage --- */
export default function ModulesPage() {
  const [modules, setModules] = useState([]);
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
  const [form, setForm] = useState({ code: "", title: "" });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [confirmAction, setConfirmAction] = useState(null); // { type: 'delete', module }
  const searchTimerRef = useRef(null);

  // permissions
  const canView = can("modules", "view");
  const canCreate = can("modules", "create");
  const canEdit = can("modules", "edit");
  const canDelete = can("modules", "delete");

  const setFormField = (k, v) =>
    setForm((p) => ({ ...p, [k]: v }));

  const fetchModules = useCallback(
    async (opts = {}) => {
      if (!canView) return;

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

        const res = await api.get(`/modules?${params.toString()}`);
        const json = await res.json();

        if (res.ok && (json.status === 1 || json.status === undefined)) {
          const list = json.data || json || [];
          const metaData =
            json.meta || {
              total: list.length,
              page: qPage,
              limit: qLimit,
              totalPages: 1,
              from: list.length ? 1 : 0,
              to: list.length,
            };
          setModules(list);
          setMeta(metaData);
          setPage(metaData.page || qPage);
          setLimit(metaData.limit || qLimit);
        } else {
          if (res.status === 401 || json.message === "Unauthorized") return;
          toast.error(json.message || "Failed to load modules");
        }
      } catch (err) {
        toast.error(
          err.message || "Network error while fetching modules"
        );
      } finally {
        setLoading(false);
      }
    },
    [page, limit, search, canView]
  );

  useEffect(() => {
    if (!canView) return;
    fetchModules({ page: 1, limit: 10 });
  }, [canView, fetchModules]);

  function onSearchChange(e) {
    const v = e.target.value;
    setSearch(v);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      fetchModules({ page: 1, limit, search: v });
      searchTimerRef.current = null;
    }, 400);
  }

  const onLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10) || 10;
    setLimit(newLimit);
    fetchModules({ page: 1, limit: newLimit, search });
  };

  const goToPage = (p) => {
    if (p < 1 || p > (meta.totalPages || 1)) return;
    fetchModules({ page: p, limit, search });
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

  function openAdd() {
    if (!canCreate) {
      toast.error("You do not have permission to create modules");
      return;
    }
    setEditingId(null);
    setForm({ code: "", title: "" });
    setShowModal(true);
  }

  async function openEdit(mod) {
    if (!canEdit) {
      toast.error("You do not have permission to edit modules");
      return;
    }
    setEditingId(mod.id);
    setForm({ code: mod.code || "", title: mod.title || "" });
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.code.trim() || !form.title.trim()) {
      toast.error("Code and title are required");
      return;
    }

    if (editingId && !canEdit) {
      toast.error("You do not have permission to update modules");
      return;
    }
    if (!editingId && !canCreate) {
      toast.error("You do not have permission to create modules");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        code: form.code.trim(),
        title: form.title.trim(),
      };

      const res = editingId
        ? await api.put(`/modules/${editingId}`, payload)
        : await api.post(`/modules`, payload);
      const json = await res.json();

      const appError =
        typeof json.status !== "undefined" &&
        (json.status === 0 || json.status === "0");
      if (!res.ok || appError) {
        if (res.status === 401 || json.message === "Unauthorized") return;
        toast.error(json.message || "Save failed");
        return;
      }
      toast.success(editingId ? "Module updated" : "Module created");
      setShowModal(false);
      setEditingId(null);
      fetchModules({ page: 1, limit, search: "" });
    } catch (err) {
      toast.error(
        err.message || "Network error while saving module"
      );
    } finally {
      setSaving(false);
    }
  }

  async function doDelete(mod) {
    if (!canDelete) {
      toast.error("You do not have permission to delete modules");
      return;
    }
    try {
      const res = await api.delete(`/modules/${mod.id}`);
      const json = await res.json();
      if (!res.ok || json.status === 0) {
        if (res.status === 401 || json.message === "Unauthorized") return;
        toast.error(json.message || "Delete failed");
        return;
      }
      toast.success("Module deleted");
      fetchModules({ page: 1, limit, search: "" });
    } catch (err) {
      toast.error(
        err.message || "Network error while deleting"
      );
    }
  }

  // unauthorized view
  if (!canView) {
    return (
      <div className="p-10 text-center text-red-600 font-bold text-xl">
        Unauthorized
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Modules
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create, edit and manage application modules.
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

          <div>
            <input
              value={search}
              onChange={onSearchChange}
              placeholder="Search modules..."
              className="border rounded px-3 py-2 w-64"
            />
          </div>

          {canCreate && (
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded shadow"
            >
              <Icon name="plus" /> Add Module
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  Created
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
                    colSpan="5"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    <Icon name="spinner" />{" "}
                    <span className="ml-2">Loading…</span>
                  </td>
                </tr>
              ) : modules.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No modules available
                  </td>
                </tr>
              ) : (
                modules.map((m, idx) => (
                  <tr
                    key={m.id}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      {(meta.from || 0) + idx + 1}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {m.code}
                    </td>
                    <td className="px-4 py-3">{m.title}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {m.created_at
                        ? new Date(
                            m.created_at
                          ).toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="inline-flex gap-2">
                        {canEdit && (
                          <button
                            onClick={() => openEdit(m)}
                            title="Edit"
                            className="px-2 py-1 border rounded text-sm bg-white hover:bg-gray-50"
                          >
                            <Icon name="pencil" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() =>
                              setConfirmAction({
                                type: "delete",
                                module: m,
                              })
                            }
                            title="Delete"
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

        <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            Showing {meta.from || 0} to {meta.to || 0} of{" "}
            {meta.total || 0}
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
            {getPageNumbers().map((p) => (
              <button
                key={p}
                onClick={() => goToPage(p)}
                className={`px-3 py-1 border rounded ${
                  p === page
                    ? "bg-emerald-600 text-white"
                    : "bg-white"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={next}
              disabled={
                page === meta.totalPages ||
                meta.totalPages === 0
              }
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              ›
            </button>
            <button
              onClick={() => goToPage(meta.totalPages || 1)}
              disabled={
                page === meta.totalPages ||
                meta.totalPages === 0
              }
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              »
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-16">
          <div
            className="fixed inset-0 bg-black opacity-40"
            onClick={() => setShowModal(false)}
          />
          <form
            onSubmit={handleSave}
            className="relative z-60 bg-white rounded-lg shadow-xl w-full max-w-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingId ? "Edit Module" : "Add Module"}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code
                </label>
                <input
                  value={form.code}
                  onChange={(e) =>
                    setFormField("code", e.target.value)
                  }
                  className="w-full border rounded px-3 py-2"
                  placeholder="example: vehicles"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  value={form.title}
                  onChange={(e) =>
                    setFormField("title", e.target.value)
                  }
                  className="w-full border rounded px-3 py-2"
                  placeholder="example: Vehicles"
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
                  {saving ? (
                    <Icon name="spinner" />
                  ) : editingId ? (
                    "Update"
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        open={!!confirmAction}
        title={
          confirmAction?.type === "delete"
            ? "Delete module?"
            : "Confirm"
        }
        message={
          confirmAction?.type === "delete"
            ? `Delete module "${confirmAction.module.title}"? This cannot be undone.`
            : "Are you sure?"
        }
        confirmText={
          confirmAction?.type === "delete" ? "Delete" : "Yes"
        }
        cancelText="Cancel"
        onConfirm={async () => {
          if (!confirmAction) return;
          const { type, module } = confirmAction;
          setConfirmAction(null);
          if (type === "delete") await doDelete(module);
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
