// src/pages/UsersPage.jsx
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
        <h3 className="text-sm font-semibold text-gray-800 mb-2">{title}</h3>
        <div className="text-sm text-gray-600 mb-4">{message}</div>
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

export default function UsersPage() {
  if (!can("users", "view")) {
    return (
      <div className="p-10 text-center text-red-600 font-bold text-xl">
        Unauthorized
      </div>
    );
  }

  const [users, setUsers] = useState([]);
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

  const [roles, setRoles] = useState([]);
  const [zones, setZones] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingZones, setLoadingZones] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    role_id: "",
    zone_id: "",
    username: "",
    email: "",
    password: "",
    status: 1,
  });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const searchTimerRef = useRef(null);

  function setFormField(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  const fetchUsers = useCallback(
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
        const res = await api.get(`/users?${params.toString()}`);
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
          setUsers(list);
          setMeta(metaData);
          setPage(metaData.page || qPage);
          setLimit(metaData.limit || qLimit);
        } else {
          toast.error(json.message || "Failed to load users");
        }
      } catch (err) {
        toast.error(err.message || "Error loading users");
      } finally {
        setLoading(false);
      }
    },
    [page, limit, search]
  );

  const loadRoles = useCallback(async () => {
    try {
      setLoadingRoles(true);
      const res = await api.get(`/usersRoles`);
      const json = await res.json();
      if (res.ok && (json.status === 1 || json.status === undefined)) {
        setRoles(json.data || json || []);
      } else {
        toast.error(json.message || "Failed to load roles");
      }
    } catch (err) {
      toast.error(err.message || "Error loading roles list");
    } finally {
      setLoadingRoles(false);
    }
  }, []);

  const loadZones = useCallback(async () => {
    try {
      setLoadingZones(true);
      const res = await api.get(`/usersZones`); 
      const json = await res.json();

      if (res.ok && (json.status === 1 || json.status === undefined)) {
        setZones(json.data || json || []);
        console.log("Zones loaded:", json.data || json || []);
      } else {
        toast.error(json.message || "Failed to load zones");
      }
    } catch (err) {
      toast.error(err.message || "Error loading zones list");
    } finally {
      setLoadingZones(false);
    }
  }, []);

  useEffect(() => {
    loadRoles();
    loadZones();
    fetchUsers({ page: 1, limit: 10 });
  }, [fetchUsers, loadRoles, loadZones]);

  function onSearchChange(e) {
    const v = e.target.value;
    setSearch(v);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      fetchUsers({ page: 1, limit, search: v });
      searchTimerRef.current = null;
    }, 400);
  }

  function changePage(p) {
    const totalPagesCalc =
      meta.totalPages || (meta.total ? Math.ceil(meta.total / limit) : 1);
    if (p < 1 || p > totalPagesCalc || p === page) return;
    fetchUsers({ page: p, limit, search });
  }

  function openAdd() {
    if (!can("users", "create")) {
      toast.error("You do not have permission to create users");
      return;
    }

    setEditingId(null);
    setForm({
      role_id: "",
      zone_id: "",
      username: "",
      email: "",
      password: "",
      status: 1,
    });

    loadZones();
    setShowModal(true);
  }

  async function openEdit(user) {
    if (!can("users", "edit")) {
      toast.error("You do not have permission to edit users");
      return;
    }

    setEditingId(user.id);
    setForm({
      role_id: user.role_id || "",
      zone_id: user.zone_id || "",
      username: user.username || "",
      email: user.email || "",
      password: "",
      status: user.status ?? 1,
    });

    loadZones();
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();

    if (!form.username.trim() || !form.email.trim()) {
      toast.error("Username and email are required");
      return;
    }
    if (!editingId && !form.password.trim()) {
      toast.error("Password required for new user");
      return;
    }

    if (editingId && !can("users", "edit")) {
      toast.error("You do not have permission to update users");
      return;
    }
    if (!editingId && !can("users", "create")) {
      toast.error("You do not have permission to create users");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        role_id: form.role_id ? Number(form.role_id) : null,
        zone_id: form.zone_id ? Number(form.zone_id) : null,
        username: form.username.trim(),
        email: form.email.trim(),
        status: Number(form.status),
      };
      if (form.password.trim()) {
        payload.password = form.password.trim();
      }

      const res = editingId
        ? await api.put(`/users/${editingId}`, payload)
        : await api.post(`/users`, payload);
      const json = await res.json();

      if (!res.ok || json.status === 0) {
        toast.error(json.message || "Save failed");
        return;
      }

      toast.success(editingId ? "User updated" : "User created");
      setShowModal(false);
      setEditingId(null);
      setSearch("");
      fetchUsers({ page: 1, limit, search: "" });
    } catch (err) {
      toast.error(err.message || "Error saving user");
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(user) {
    if (!can("users", "edit")) {
      toast.error("You do not have permission to change status");
      return;
    }
    try {
      const newStatus = user.status === 1 ? 0 : 1;
      const res = await api.patch(`/users/${user.id}/status`, {
        status: newStatus,
      });
      const json = await res.json();
      if (!res.ok || json.status === 0) {
        toast.error(json.message || "Failed to update status");
        return;
      }
      toast.success("Status updated");
      fetchUsers({ page, limit, search });
    } catch (err) {
      toast.error(err.message || "Error updating status");
    }
  }

  const totalPages =
    meta.totalPages || (meta.total ? Math.ceil(meta.total / limit) : 1);
  const start = meta.from || (meta.total ? (page - 1) * limit + 1 : 0);
  const end = meta.to || (meta.total ? Math.min(meta.total, page * limit) : 0);

  function getRoleName(roleId) {
    const r = roles.find((x) => x.id === roleId);
    return r ? (r.name || r.title || r.role_name || r.role_title) : "-";
  }

  function getZoneName(zoneId) {
    const z = zones.find((x) => x.id === zoneId);
    return z ? (z.name || z.title || z.zone_name || z.zone_title) : "-";
  }

  return (
    <div className="p-6 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Users</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create, edit and manage application users.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show</span>
            <select
              value={limit}
              onChange={(e) => {
                const newLimit = parseInt(e.target.value, 10) || 10;
                setLimit(newLimit);
                fetchUsers({ page: 1, limit: newLimit, search });
              }}
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
            placeholder="Search users..."
            className="border rounded px-3 py-2 w-64"
          />

          {can("users", "create") && (
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded shadow"
            >
              <Icon name="plus" /> Add User
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
                  Username
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  Zone
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  Status
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
                    colSpan="8"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    <Icon name="spinner" />{" "}
                    <span className="ml-2">Loading…</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No users available
                  </td>
                </tr>
              ) : (
                users.map((u, idx) => (
                  <tr key={u.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{start + idx}</td>
                    <td className="px-4 py-3 font-medium">{u.username}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">{getRoleName(u.role_id)}</td>
                    <td className="px-4 py-3">{getZoneName(u.zone_id)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          "inline-flex px-2 py-1 rounded-full text-xs " +
                          (u.status === 1
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700")
                        }
                      >
                        {u.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {u.created_at
                        ? new Date(u.created_at).toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="inline-flex gap-2">
                        {can("users", "edit") && (
                          <button
                            onClick={() => openEdit(u)}
                            title="Edit"
                            className="px-2 py-1 border rounded text-sm bg-white hover:bg-gray-50"
                          >
                            <Icon name="pencil" />
                          </button>
                        )}
                        {can("users", "edit") && (
                          <button
                            onClick={() =>
                              setConfirmAction({ type: "status", user: u })
                            }
                            title="Change Status"
                            className={
                              "px-2 py-1 border rounded text-sm bg-white hover:bg-gray-50 " +
                              (u.status === 1
                                ? "text-red-600"
                                : "text-green-600")
                            }
                          >
                            {u.status === 1 ? "Deactivate" : "Activate"}
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
            {meta.total ? (
              <>
                Showing {start} to {end} of {meta.total}
              </>
            ) : (
              <>Showing 0 to 0 of 0</>
            )}
          </div>
          <div className="flex items-center gap-2">
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
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-16 bg-black bg-opacity-40">
          <form
            onSubmit={handleSave}
            className="relative z-60 bg-white rounded-lg shadow-xl w-full max-w-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingId ? "Edit User" : "Add User"}
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
                  Role
                </label>
                <select
                  value={form.role_id}
                  onChange={(e) => setFormField("role_id", e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  disabled={loadingRoles}
                >
                  <option value="">
                    {loadingRoles ? "Loading roles..." : "-- select role --"}
                  </option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name || r.title || r.role_name || r.role_title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zone
                </label>
                <select
                  value={form.zone_id}
                  onChange={(e) => setFormField("zone_id", e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  disabled={loadingZones}
                >
                  <option value="">
                    {loadingZones ? "Loading zones..." : "-- select zone --"}
                  </option>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name || z.title || z.zone_name || z.zone_title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  value={form.username}
                  onChange={(e) => setFormField("username", e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setFormField("email", e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setFormField("password", e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder={
                    editingId
                      ? "Leave blank to keep current password"
                      : "Password"
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setFormField("status", e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
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
          </form>
        </div>
      )}

      <ConfirmModal
        open={!!confirmAction}
        title="Change user status?"
        message={
          confirmAction?.user
            ? `Change status of "${confirmAction.user.username}" to ${
                confirmAction.user.status === 1 ? "Inactive" : "Active"
              }?`
            : ""
        }
        confirmText="Yes"
        cancelText="Cancel"
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => {
          if (confirmAction?.user) changeStatus(confirmAction.user);
          setConfirmAction(null);
        }}
      />
    </div>
  );
}
