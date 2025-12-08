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
          <path d="M3 21v-3.75L17.81 2.69a2.12 2.12 0 0 1 3 0l.5.5a2.12 2.12 0 0 1 0 3L6.5 20.75H3z" />
          <path d="M14.5 5.5L18.5 9.5" />
        </svg>
      );
    case "trash":
      return (
        <svg className={common} viewBox="0 0 24 24" width="16" height="16" fill="none">
          <path d="M3 6h18" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 6V4h8v2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case "plus":
      return (
        <svg className={common} viewBox="0 0 24 24" width="16" height="16" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case "spinner":
      return (
        <svg className={`animate-spin ${common}`} viewBox="0 0 24 24" width="18" height="18" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
          <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    default:
      return null;
  }
}

function ConfirmModal({ open, title, message, confirmText, cancelText, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative z-50 w-full max-w-xs bg-white rounded-lg shadow-lg p-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">{title}</h3>
        <div className="text-sm text-gray-600 mb-4">{message}</div>
        <div className="flex justify-end gap-2">
          <button className="px-3 py-1 bg-gray-100 rounded" onClick={onCancel}>
            {cancelText}
          </button>
          <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 0, from: 0, to: 0 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", status: 1 });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const searchTimerRef = useRef(null);

  const fetchRoles = useCallback(
    async (opts = {}) => {
      const qPage = opts.page ?? page;
      const qLimit = opts.limit ?? limit;
      const qSearch = typeof opts.search !== "undefined" ? opts.search : search;

      setLoading(true);
      try {
        const params = new URLSearchParams({ page: qPage, limit: qLimit, search: qSearch });
        const res = await api.get(`/roles?${params.toString()}`);
        const json = await res.json();

        if (res.ok || json.status === 1) {
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
          setRoles(list);
          setMeta(metaData);
          setPage(metaData.page || qPage);
        } else toast.error(json.message || "Failed to load roles");
      } catch (err) {
        toast.error(err.message || "Error loading roles");
      } finally {
        setLoading(false);
      }
    },
    [page, limit, search]
  );

  useEffect(() => {
    fetchRoles({ page: 1, limit: 10 });
  }, [fetchRoles]);

  function setFormField(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function openAdd() {
    if (!can("roles", "create")) return toast.error("No permission to create roles");
    setEditingId(null);
    setForm({ name: "", description: "", status: 1 });
    setShowModal(true);
  }

  function openEdit(role) {
    if (!can("roles", "edit")) return toast.error("No permission to edit roles");
    setEditingId(role.id);
    setForm({ name: role.name || "", description: role.description || "", status: role.status ?? 1 });
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Role name required");

    if (editingId && !can("roles", "edit")) return toast.error("No permission to update roles");
    if (!editingId && !can("roles", "create")) return toast.error("No permission to create roles");

    setSaving(true);
    try {
      const payload = { name: form.name.trim(), description: form.description, status: form.status };
      const res = editingId ? await api.put(`/roles/${editingId}`, payload) : await api.post(`/roles`, payload);
      const json = await res.json();

      if (!res.ok || json.status === 0) return toast.error(json.message || "Save failed");

      toast.success(editingId ? "Role updated" : "Role created");
      setShowModal(false);
      fetchRoles({ page: 1, limit, search: "" });
    } catch (err) {
      toast.error("Error saving role");
    } finally {
      setSaving(false);
    }
  }

  async function doDelete(role) {
    if (!can("roles", "delete")) return toast.error("No permission to delete roles");

    try {
      const res = await api.del(`/roles/${role.id}`);
      const json = await res.json();
      if (!res.ok || json.status === 0) return toast.error(json.message || "Delete failed");

      toast.success("Role deleted");
      fetchRoles({ page: 1, limit, search: "" });
    } catch (err) {
      toast.error("Error deleting role");
    }
  }

  const totalPages = meta.totalPages || (meta.total ? Math.ceil(meta.total / limit) : 1);
  const start = meta.from || (meta.total ? (page - 1) * limit + 1 : 0);
  const end = meta.to || (meta.total ? Math.min(meta.total, page * limit) : 0);

  function changePage(p) {
    if (p < 1 || p > totalPages || p === page) return;
    fetchRoles({ page: p, limit, search });
  }

  return (
    <div className="p-6 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Roles</h1>
          <p className="text-sm text-gray-500">Create, edit & manage roles</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
              searchTimerRef.current = setTimeout(() => fetchRoles({ page: 1, limit, search: e.target.value }), 400);
            }}
            placeholder="Search..."
            className="border px-3 py-2 rounded"
          />

          {can("roles", "create") && (
            <button onClick={openAdd} className="bg-emerald-600 text-white px-4 py-2 rounded flex gap-2 items-center">
              <Icon name="plus" /> Add Role
            </button>
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-6">
                  Loading...
                </td>
              </tr>
            ) : roles.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-6">
                  No roles found
                </td>
              </tr>
            ) : (
              roles.map((role, idx) => (
                <tr key={role.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{start + idx}</td>
                  <td className="px-4 py-3">{role.name}</td>
                  <td className="px-4 py-3">{role.description || "-"}</td>
                  <td className="px-4 py-3">
                    {role.status === 1 ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-red-600">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    {can("roles", "edit") && (
                      <button className="border px-2 py-1 rounded" onClick={() => openEdit(role)}>
                        <Icon name="pencil" />
                      </button>
                    )}
                    {can("roles", "delete") && (
                      <button
                        className="border px-2 py-1 rounded text-red-600"
                        onClick={() => setConfirmAction({ type: "delete", role })}
                      >
                        <Icon name="trash" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* pagination footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-gray-600">
          <div>
            {meta.total ? (
              <span>
                Showing {start} to {end} of {meta.total}
              </span>
            ) : (
              <span>Showing 0 to 0 of 0</span>
            )}
          </div>

          <div className="inline-flex items-center gap-1">
            <button
              onClick={() => changePage(1)}
              disabled={page === 1}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              «
            </button>
            <button
              onClick={() => changePage(page - 1)}
              disabled={page === 1}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              ‹
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => changePage(p)}
                  className={`px-3 py-1 border rounded ${
                    p === page ? "bg-emerald-600 text-white" : "bg-white"
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => changePage(page + 1)}
              disabled={page === totalPages}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              ›
            </button>
            <button
              onClick={() => changePage(totalPages)}
              disabled={page === totalPages}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              »
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">{editingId ? "Edit Role" : "Add New Role"}</h2>

            <form onSubmit={handleSave}>
              <div className="mb-3">
                <label className="block mb-1 text-sm">Role Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setFormField("name", e.target.value)}
                  className="border px-3 py-2 rounded w-full"
                />
              </div>

              <div className="mb-3">
                <label className="block mb-1 text-sm">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setFormField("description", e.target.value)}
                  className="border px-3 py-2 rounded w-full"
                />
              </div>

              <div className="mb-3">
                <label className="block mb-1 text-sm">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setFormField("status", e.target.value)}
                  className="border px-3 py-2 rounded w-full"
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-emerald-600 text-white rounded">
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!confirmAction}
        title="Delete Role?"
        message={confirmAction?.role ? `Delete role "${confirmAction.role.name}"?` : ""}
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => {
          doDelete(confirmAction.role);
          setConfirmAction(null);
        }}
      />
    </div>
  );
}
