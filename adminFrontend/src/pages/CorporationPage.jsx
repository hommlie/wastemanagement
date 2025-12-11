// adminFrontend/src/pages/CorporationPage.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { can } from "../utils/permission";

function Icon({ name, className = "" }) {
  const common = `inline-block align-middle ${className}`;
  switch (name) {
    case "plus":
      return (
        <svg className={common} viewBox="0 0 24 24" width="16" height="16" fill="none">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
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
    case "chevron-down":
      return (
        <svg
          className={common}
          viewBox="0 0 20 20"
          width="16"
          height="16"
          fill="none"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
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

/**
 * Simple searchable dropdown for State / City
 */
function SearchableSelect({
  placeholder = "Select...",
  value,
  onChange,
  options,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef(null);

  const selected = options.find((o) => String(o.id) === String(value));

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const filtered = options.filter((o) =>
    o.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setOpen((v) => !v);
        }}
        className={`w-full border rounded px-3 py-2 flex items-center justify-between text-left ${
          disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white"
        }`}
      >
        <span className={selected ? "text-gray-900" : "text-gray-400"}>
          {selected ? selected.name : placeholder}
        </span>
        <Icon
          name="chevron-down"
          className={`ml-2 transition-transform ${
            open ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {open && !disabled && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg">
          <div className="p-2 border-b">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to search..."
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>
          <div className="max-h-60 overflow-y-auto text-sm">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-gray-500">No results</div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onChange(String(opt.id));
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-emerald-50 ${
                    String(opt.id) === String(value)
                      ? "bg-emerald-50 font-medium"
                      : ""
                  }`}
                >
                  {opt.name}
                </button>
              ))
            )}
          </div>
          <div className="flex justify-end items-center gap-4 px-3 py-2 text-xs text-gray-500 border-t">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setQuery("");
              }}
              className="hover:underline"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="hover:underline"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CorporationPage() {
  if (!can("corporation", "view")) {
    return (
      <div className="p-10 text-center text-red-600 font-bold text-xl">
        Unauthorized
      </div>
    );
  }

  const [rows, setRows] = useState([]);
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
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [form, setForm] = useState({
    state_id: "",
    city_id: "",
    name: "",
    status: 1,
  });

  const [confirmAction, setConfirmAction] = useState(null); // { type: 'delete' | 'status', row }
  const searchTimerRef = useRef(null);

  const setFormField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const fetchStates = useCallback(async () => {
    try {
      const res = await api.get("/corporation/state");
      const json = await res.json();
      if (res.ok && json.status === 1) {
        setStates(json.data || []);
      }
    } catch (e) {}
  }, []);

  const fetchCitiesByState = useCallback(async (stateId) => {
    if (!stateId) {
      setCities([]);
      return;
    }
    try {
      const res = await api.get(`/corporation/city/${stateId}`);
      const json = await res.json();
      if (res.ok && json.status === 1) {
        setCities(json.data || []);
      } else {
        setCities([]);
      }
    } catch (e) {
      setCities([]);
    }
  }, []);

  const fetchRows = useCallback(
    async (opts = {}) => {
      const qPage = opts.page ?? page;
      const qLimit = opts.limit ?? limit;
      const qSearch = typeof opts.search !== "undefined" ? opts.search : search;

      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: qPage,
          limit: qLimit,
          search: qSearch || "",
        });
        const res = await api.get(`/corporation?${params.toString()}`);
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
          setRows(list);
          setMeta(metaData);
          setPage(metaData.page || qPage);
          setLimit(metaData.limit || qLimit);
        } else {
          if (res.status === 401 || json.message === "Unauthorized") return;
          toast.error(json.message || "Failed to load corporations");
        }
      } catch (err) {
        toast.error(err.message || "Network error while fetching corporations");
      } finally {
        setLoading(false);
      }
    },
    [page, limit, search]
  );

  useEffect(() => {
    fetchStates();
    fetchRows({ page: 1, limit: 10 });
  }, [fetchStates, fetchRows]);

  function onSearchChange(e) {
    const v = e.target.value;
    setSearch(v);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      fetchRows({ page: 1, limit, search: v });
      searchTimerRef.current = null;
    }, 400);
  }

  const onLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10) || 10;
    setLimit(newLimit);
    fetchRows({ page: 1, limit: newLimit, search });
  };

  const goToPage = (p) => {
    const totalPages =
      meta.totalPages || (meta.total ? Math.ceil(meta.total / limit) : 1);
    if (p < 1 || p > totalPages) return;
    fetchRows({ page: p, limit, search });
  };
  const prev = () => goToPage(page - 1);
  const next = () => goToPage(page + 1);

  const totalPages =
    meta.totalPages || (meta.total ? Math.ceil(meta.total / limit) : 1);

  function getPageNumbers() {
    const current = page;
    const delta = 2;
    let left = Math.max(1, current - delta);
    let right = Math.min(totalPages, current + delta);
    if (current - left < delta)
      right = Math.min(totalPages, right + (delta - (current - left)));
    if (right - current < delta)
      left = Math.max(1, left - (delta - (right - current)));
    const arr = [];
    for (let i = left; i <= right; i++) arr.push(i);
    return arr;
  }

  function resetForm() {
    setForm({
      state_id: "",
      city_id: "",
      name: "",
      status: 1,
    });
    setCities([]);
  }

  function openAdd() {
    if (!can("corporation", "create")) {
      toast.error("You do not have permission to create corporations");
      return;
    }
    setEditingId(null);
    resetForm();
    setShowModal(true);
  }

  function openEdit(row) {
    if (!can("corporation", "edit")) {
      toast.error("You do not have permission to edit corporations");
      return;
    }
    setEditingId(row.id);
    const stateId = row.state_id || (row.state && row.state.id) || "";
    const cityId = row.city_id || (row.city && row.city.id) || "";
    setForm({
      state_id: stateId,
      city_id: cityId,
      name: row.name || "",
      status: typeof row.status !== "undefined" ? row.status : 1,
    });
    fetchCitiesByState(stateId);
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();

    if (!form.state_id) {
      toast.error("State is required");
      return;
    }
    if (!form.city_id) {
      toast.error("City is required");
      return;
    }
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }

    const payload = {
      state_id: Number(form.state_id),
      city_id: Number(form.city_id),
      name: form.name.trim(),
      status: Number(form.status),
    };

    setSaving(true);
    try {
      const res = editingId
        ? await api.put(`/corporation/${editingId}`, payload)
        : await api.post("/corporation", payload);

      const json = await res.json();

      const appError =
        typeof json.status !== "undefined" &&
        (json.status === 0 || json.status === "0");

      if (!res.ok || appError) {
        if (res.status === 401 || json.message === "Unauthorized") return;
        toast.error(json.message || "Save failed");
        return;
      }

      toast.success(editingId ? "Corporation updated" : "Corporation created");
      setShowModal(false);
      setEditingId(null);
      resetForm();
      fetchRows({ page: 1, limit, search: "" });
    } catch (err) {
      toast.error(err.message || "Network error while saving");
    } finally {
      setSaving(false);
    }
  }

  async function doDelete(row) {
    if (!can("corporation", "delete")) {
      toast.error("You do not have permission to delete corporations");
      return;
    }
    try {
      const res = await api.del(`/corporation/${row.id}`);
      const json = await res.json();
      if (!res.ok || json.status === 0) {
        toast.error(json.message || "Delete failed");
        return;
      }
      toast.success("Corporation deleted");
      fetchRows({ page: 1, limit, search: "" });
    } catch (err) {
      toast.error(err.message || "Network error while deleting");
    }
  }

  // UPDATED: use PUT (existing update endpoint) and sirf status bhejo
  async function toggleStatus(row) {
    if (!can("corporation", "edit")) {
      toast.error("You do not have permission to update status");
      return;
    }
    const newStatus = row.status === 1 ? 0 : 1;
    try {
      const res = await api.put(`/corporation/${row.id}`, {
        status: newStatus,
      });
      const json = await res.json();
      const appError =
        typeof json.status !== "undefined" &&
        (json.status === 0 || json.status === "0");
      if (!res.ok || appError) {
        toast.error(json.message || "Failed to update status");
        return;
      }
      toast.success(
        newStatus === 1 ? "Corporation activated" : "Corporation deactivated"
      );
      fetchRows({ page, limit, search });
    } catch (err) {
      toast.error(err.message || "Network error while updating status");
    }
  }

  return (
    <div className="p-6 mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Corporation Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage corporations mapped with state and city.
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
              placeholder="Search corporations..."
              className="border rounded px-3 py-2 w-64"
            />
          </div>

          {can("corporation", "create") && (
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded shadow"
            >
              <Icon name="plus" /> Add Corporation
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">State</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">City</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Created</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    <Icon name="spinner" /> <span className="ml-2">Loading…</span>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    No corporations available
                  </td>
                </tr>
              ) : (
                rows.map((r, idx) => (
                  <tr key={r.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{(meta.from || 0) + idx}</td>
                    <td className="px-4 py-3 font-medium">{r.name}</td>
                    <td className="px-4 py-3">
                      {r.state ? r.state.name : r.state_name || "-"}
                    </td>
                    <td className="px-4 py-3">
                      {r.city ? r.city.name : r.city_name || "-"}
                    </td>
                    <td className="px-4 py-3">
                      {r.status === 1 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.created_at ? new Date(r.created_at).toLocaleString() : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="inline-flex gap-2">
                        {can("corporation", "edit") && (
                          <>
                            <button
                              onClick={() => openEdit(r)}
                              title="Edit"
                              className="px-2 py-1 border rounded text-sm bg-white hover:bg-gray-50"
                            >
                              <Icon name="pencil" />
                            </button>
                            {/* UPDATED: ab direct toggle nahi, pehle confirmAction set karega */}
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmAction({ type: "status", row: r })
                              }
                              className={`px-3 py-1 text-sm rounded border ${
                                r.status === 1
                                  ? "bg-red-50 text-red-600 border-red-200"
                                  : "bg-emerald-50 text-emerald-600 border-emerald-200"
                              }`}
                            >
                              {r.status === 1 ? "Deactivate" : "Activate"}
                            </button>
                          </>
                        )}
                        {can("corporation", "delete") && (
                          <button
                            onClick={() =>
                              setConfirmAction({ type: "delete", row: r })
                            }
                            title="Delete"
                            className="px-3 py-1 border rounded text-sm bg-white hover:bg-gray-50 text-red-600"
                          >
                            Delete
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
                Showing {meta.from || 0} to {meta.to || 0} of{" "}
                {meta.total || 0}
              </>
            ) : (
              <>Showing 0 to 0 of 0</>
            )}
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
                  p === page ? "bg-emerald-600 text-white" : "bg-white"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={next}
              disabled={page === totalPages}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              ›
            </button>
            <button
              onClick={() => goToPage(totalPages)}
              disabled={page === totalPages}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              »
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={!!confirmAction}
        title={
          confirmAction?.type === "delete"
            ? "Delete corporation?"
            : confirmAction?.type === "status"
            ? confirmAction.row.status === 1
              ? "Deactivate corporation?"
              : "Activate corporation?"
            : "Confirm"
        }
        message={
          confirmAction?.type === "delete"
            ? `Delete corporation "${confirmAction.row.name}"? This cannot be undone.`
            : confirmAction?.type === "status"
            ? confirmAction.row.status === 1
              ? `Deactivate corporation "${confirmAction.row.name}"?`
              : `Activate corporation "${confirmAction.row.name}"?`
            : "Are you sure?"
        }
        confirmText={
          confirmAction?.type === "delete"
            ? "Delete"
            : confirmAction?.type === "status"
            ? confirmAction.row.status === 1
              ? "Deactivate"
              : "Activate"
            : "Yes"
        }
        cancelText="Cancel"
        onConfirm={async () => {
          if (!confirmAction) return;
          const { type, row } = confirmAction;
          setConfirmAction(null);
          if (type === "delete") {
            await doDelete(row);
          } else if (type === "status") {
            await toggleStatus(row);
          }
        }}
        onCancel={() => setConfirmAction(null)}
      />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-16 overflow-auto">
          <div
            className="fixed inset-0 bg-black opacity-40"
            onClick={() => {
              setShowModal(false);
              setEditingId(null);
            }}
          />
          <form
            onSubmit={handleSave}
            className="relative z-60 bg-white rounded-lg shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingId ? "Edit Corporation" : "Add Corporation"}
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

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <SearchableSelect
                  placeholder="Select state"
                  value={form.state_id}
                  options={states}
                  onChange={(id) => {
                    setFormField("state_id", id);
                    setFormField("city_id", "");
                    fetchCitiesByState(id);
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <SearchableSelect
                  placeholder="Select city"
                  value={form.city_id}
                  options={cities}
                  disabled={!form.state_id}
                  onChange={(id) => setFormField("city_id", id)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setFormField("name", e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Corporation name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setFormField("status", parseInt(e.target.value, 10))
                  }
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
                {saving ? <Icon name="spinner" /> : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
