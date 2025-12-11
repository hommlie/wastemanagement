// adminFrontend/src/pages/ZonesPage.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { can } from "../utils/permission";

function Icon({ name, className = "" }) {
  const common = `inline-block align-middle ${className}`;
  switch (name) {
    case "plus":
      return (
        <svg className={common} viewBox="0 0 24 24" width="16" height="16" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "spinner":
      return (
        <svg className={`animate-spin ${common}`} viewBox="0 0 24 24" width="18" height="18" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
          <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "edit":
      return (
        <svg className={common} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-3.75L17.81 2.69a2.12 2.12 0 0 1 3 0l.5.5a2.12 2.12 0 0 1 0 3L6.5 20.75H3z" />
        </svg>
      );
    default:
      return null;
  }
}

function ConfirmModal({ open, title = "Confirm", message = "Are you sure?", confirmText = "Yes", cancelText = "No", onConfirm = () => {}, onCancel = () => {} }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative z-70 w-full max-w-xs bg-white rounded-lg shadow-lg p-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">{title}</h3>
        <div className="text-sm text-gray-600 mb-4">{message}</div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="px-3 py-1 rounded border text-sm text-gray-700 bg-gray-50 hover:bg-gray-100">
            {cancelText}
          </button>
          <button type="button" onClick={onConfirm} className="px-3 py-1 rounded bg-emerald-600 text-white text-sm hover:bg-emerald-700">
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

/* simple searchable select */
function SearchableSelect({ label, options = [], value, onChange, placeholder = "Search...", disabled = false }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = options.filter((o) => String(o.name).toLowerCase().includes(query.toLowerCase()));
  const selected = options.find((o) => String(o.id) === String(value));

  return (
    <div ref={ref} className="relative">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((s) => !s)}
        className={`w-full text-left px-3 py-2 border rounded-md shadow-sm bg-white flex items-center justify-between ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <span className={`truncate ${selected ? "text-gray-900" : "text-gray-500"}`}>{selected ? selected.name : placeholder}</span>
        <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="none">
          <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && !disabled && (
        <div className="absolute left-0 right-0 mt-2 z-40 bg-white border rounded-md shadow-lg">
          <div className="p-2">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Type to search..." className="w-full border rounded px-3 py-2 text-sm" autoFocus />
          </div>
          <div className="max-h-48 overflow-auto">
            {filtered.length === 0 ? (
              <div className="p-3 text-sm text-gray-500">No results</div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    onChange(String(opt.id));
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-50 text-sm ${String(opt.id) === String(value) ? "bg-emerald-50 font-medium" : ""}`}
                >
                  {opt.name}
                </button>
              ))
            )}
          </div>
          <div className="flex items-center justify-end p-2 border-t">
            <button type="button" onClick={() => { onChange(""); setOpen(false); setQuery(""); }} className="text-xs text-gray-500 mr-2">
              Clear
            </button>
            <button type="button" onClick={() => setOpen(false)} className="text-xs text-gray-500">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ZonesPage() {
  const [zones, setZones] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 0, from: 0, to: 0 });
  const [loading, setLoading] = useState(false);

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [corporations, setCorporations] = useState([]);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ state_id: "", city_id: "", corporation_id: "", name: "", code: "", status: 1 });

  const [confirmAction, setConfirmAction] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const searchTimerRef = useRef(null);

  const canView = can("zone", "view");
  const canCreate = can("zone", "create");
  const canEdit = can("zone", "edit");
  const canDelete = can("zone", "delete");
  const canStatus = can("zone", "status");

  const setFormField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // ---- API helpers ----
  const fetchStates = useCallback(async () => {
    try {
      const res = await api.get("/zone/state");
      const json = await res.json();
      if (res.ok && json.status === 1) setStates(json.data || []);
    } catch (err) {
      toast.error(err.message || "Failed to load states");
    }
  }, []);

  const fetchCities = useCallback(async (stateId) => {
    if (!stateId) {
      setCities([]);
      return [];
    }
    try {
      const res = await api.get(`/zone/city/${stateId}`);
      const json = await res.json();
      if (res.ok && json.status === 1) {
        setCities(json.data || []);
        return json.data || [];
      }
    } catch (err) {
      // ignore
    }
    setCities([]);
    return [];
  }, []);

  // endpoint matches backend controller: /zone/corporations/:city_id
  const fetchCorporations = useCallback(async (cityId) => {
    if (!cityId) {
      setCorporations([]);
      return [];
    }
    try {
      const res = await api.get(`/zone/corporations/${cityId}`);
      const json = await res.json();
      if (res.ok && json && (json.status === 1 || typeof json.status === "undefined")) {
        const data = json.data || json;
        setCorporations(data || []);
        return data || [];
      }
    } catch (err) {
      // ignore
    }
    setCorporations([]);
    return [];
  }, []);

  const fetchZones = useCallback(
    async (opts = {}) => {
      if (!canView) return;
      const qPage = opts.page ?? page;
      const qLimit = opts.limit ?? limit;
      const qSearch = typeof opts.search !== "undefined" ? opts.search : search;

      setLoading(true);
      try {
        const params = new URLSearchParams({ page: qPage, limit: qLimit, search: qSearch || "" });
        const res = await api.get(`/zone?${params.toString()}`);
        const json = await res.json();

        if (res.ok && (json.status === 1 || json.status === undefined)) {
          const list = json.data || json || [];
          const metaData = json.meta || { total: list.length, page: qPage, limit: qLimit, totalPages: 1, from: list.length ? 1 : 0, to: list.length };
          setZones(list);
          setMeta(metaData);
          setPage(metaData.page || qPage);
          setLimit(metaData.limit || qLimit);
        } else {
          if (res.status === 401 || json.message === "Unauthorized") return;
          toast.error(json.message || "Failed to load zones");
        }
      } catch (err) {
        toast.error(err.message || "Network error while fetching zones");
      } finally {
        setLoading(false);
      }
    },
    [page, limit, search, canView]
  );

  useEffect(() => {
    if (!canView) return;
    fetchStates();
    fetchZones({ page: 1, limit: 10 });
  }, [canView, fetchStates, fetchZones]);

  // ---- search / pagination ----
  function onSearchChange(e) {
    const v = e.target.value;
    setSearch(v);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      fetchZones({ page: 1, limit, search: v });
      searchTimerRef.current = null;
    }, 400);
  }

  const onLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10) || 10;
    setLimit(newLimit);
    fetchZones({ page: 1, limit: newLimit, search });
  };

  const goToPage = (p) => {
    if (p < 1 || p > (meta.totalPages || 1)) return;
    fetchZones({ page: p, limit, search });
  };

  const getPageNumbers = () => {
    const total = meta.totalPages || 1;
    const current = page;
    const delta = 2;
    let left = Math.max(1, current - delta);
    let right = Math.min(total, current + delta);
    if (current - left < delta) right = Math.min(total, right + (delta - (current - left)));
    if (right - current < delta) left = Math.max(1, left - (delta - (right - current)));
    const arr = [];
    for (let i = left; i <= right; i++) arr.push(i);
    return arr;
  };

  // ---- cascade dropdowns ----
  useEffect(() => {
    if (form.state_id) fetchCities(form.state_id);
    else setCities([]);
    setForm((p) => ({ ...p, city_id: "", corporation_id: "" }));
    setCorporations([]);
  }, [form.state_id, fetchCities]);

  useEffect(() => {
    if (form.city_id) fetchCorporations(form.city_id);
    else setCorporations([]);
    setForm((p) => ({ ...p, corporation_id: "" }));
  }, [form.city_id, fetchCorporations]);

  // ---- add / edit ----
  function openCreate() {
    if (!canCreate) {
      toast.error("You do not have permission to create zones");
      return;
    }
    setEditingId(null);
    setForm({ state_id: "", city_id: "", corporation_id: "", name: "", code: "", status: 1 });
    setSubmitError(null);
    setShowModal(true);
  }

  // helper: inject item to array (by id) if not present
  const injectIfMissing = (arr, item) => {
    if (!item || !item.id) return arr;
    const exists = arr.some((x) => String(x.id) === String(item.id));
    if (exists) return arr;
    return [item, ...arr];
  };

  // robust openEdit: fetch /zone/:id, set cities & corporations arrays, inject current ones to ensure selected shows
  async function openEdit(zoneRow) {
    if (!canEdit) {
      toast.error("You do not have permission to edit zones");
      return;
    }

    setEditingId(zoneRow.id);
    setSubmitError(null);

    // attempt to use zoneRow.corporation if present to pre-fill quickly
    const corpQuick = (zoneRow.corporation && (typeof zoneRow.corporation === "object" ? zoneRow.corporation : null)) || null;
    const quickStateId = corpQuick ? (corpQuick.state_id ?? (corpQuick.state && corpQuick.state.id)) : "";
    const quickCityId = corpQuick ? (corpQuick.city_id ?? (corpQuick.city && corpQuick.city.id)) : "";
    const quickCorpId = corpQuick ? corpQuick.id : zoneRow.corporation_id || "";

    // optimistic injection so UI shows right away
    if (corpQuick && corpQuick.city) {
      setCities((prev) => injectIfMissing(prev, corpQuick.city));
    }
    if (corpQuick) {
      setCorporations((prev) => injectIfMissing(prev, corpQuick));
    }

    // set form partial so state select shows immediately
    setForm((p) => ({ ...p, state_id: quickStateId ? String(quickStateId) : p.state_id }));

    try {
      const res = await api.get(`/zone/${zoneRow.id}`);
      const json = await res.json();

      if (res.ok && json && json.status === 1 && json.data) {
        const payload = json.data;
        const zone = payload.zone || payload;
        const payloadCities = Array.isArray(payload.cities) ? payload.cities : [];
        const payloadCorporations = Array.isArray(payload.corporations) ? payload.corporations : [];

        // merge/replace cities list if returned by backend
        if (payloadCities.length > 0) {
          setCities((prev) => {
            const map = {};
            [...payloadCities, ...prev].forEach((c) => { map[String(c.id)] = c; });
            return Object.values(map);
          });
        } else if (quickStateId) {
          // fetch if not provided
          await fetchCities(quickStateId);
        }

        if (payloadCorporations.length > 0) {
          setCorporations((prev) => {
            const map = {};
            [...payloadCorporations, ...prev].forEach((c) => { map[String(c.id)] = c; });
            return Object.values(map);
          });
        } else if (quickCityId) {
          await fetchCorporations(quickCityId);
        }

        // set form with proper string ids
        const stateId = (zone.corporation && (zone.corporation.state_id ?? (zone.corporation.state && zone.corporation.state.id))) || "";
        const cityId = (zone.corporation && (zone.corporation.city_id ?? (zone.corporation.city && zone.corporation.city.id))) || "";
        const corporationId = (zone.corporation && (zone.corporation.id)) || zone.corporation_id || "";

        // ensure selected items exist in lists (inject if not)
        if (zone.corporation && zone.corporation.city) {
          setCities((prev) => injectIfMissing(prev, zone.corporation.city));
        }
        if (zone.corporation) {
          setCorporations((prev) => injectIfMissing(prev, zone.corporation));
        }

        setForm({
          state_id: stateId ? String(stateId) : "",
          city_id: cityId ? String(cityId) : "",
          corporation_id: corporationId ? String(corporationId) : "",
          name: zone.name || "",
          code: zone.code || "",
          status: zone.status ?? 1,
        });
      } else {
        // fallback: use quick values and fetch lists
        if (quickStateId) await fetchCities(quickStateId);
        if (quickCityId) await fetchCorporations(quickCityId);

        setForm({
          state_id: quickStateId ? String(quickStateId) : "",
          city_id: quickCityId ? String(quickCityId) : "",
          corporation_id: quickCorpId ? String(quickCorpId) : "",
          name: zoneRow.name || "",
          code: zoneRow.code || "",
          status: zoneRow.status ?? 1,
        });
      }
    } catch (err) {
      // on error fallback to quick injection and fetch lists
      try {
        if (quickStateId) await fetchCities(quickStateId);
        if (quickCityId) await fetchCorporations(quickCityId);
      } catch (e) {
        // ignore
      }

      setForm({
        state_id: quickStateId ? String(quickStateId) : "",
        city_id: quickCityId ? String(quickCityId) : "",
        corporation_id: quickCorpId ? String(quickCorpId) : "",
        name: zoneRow.name || "",
        code: zoneRow.code || "",
        status: zoneRow.status ?? 1,
      });
    }

    setShowModal(true);
  }

  async function doSave(e) {
    e.preventDefault();
    setSubmitError(null);

    if (!form.corporation_id || !form.name.trim()) {
      toast.error("Corporation and zone name are required");
      return;
    }

    if (editingId && !canEdit) {
      toast.error("You do not have permission to update zones");
      return;
    }
    if (!editingId && !canCreate) {
      toast.error("You do not have permission to create zones");
      return;
    }

    setSaving(true);
    try {
      const payload = { corporation_id: parseInt(form.corporation_id, 10), name: form.name.trim(), code: form.code ? form.code.trim() : null, status: form.status };
      const res = editingId ? await api.put(`/zone/${editingId}`, payload) : await api.post("/zone", payload);
      const json = await res.json();

      const appError = typeof json.status !== "undefined" && (json.status === 0 || json.status === "0");

      if (!res.ok || appError) {
        if (res.status === 401 || json.message === "Unauthorized") return;
        const msg = json.message || "Save failed";
        toast.error(msg);
        setSubmitError(msg);
        return;
      }

      toast.success(editingId ? "Zone updated" : "Zone created");
      setShowModal(false);
      setEditingId(null);
      setForm({ state_id: "", city_id: "", corporation_id: "", name: "", code: "", status: 1 });
      fetchZones({ page: 1, limit, search: "" });
    } catch (err) {
      toast.error(err.message || "Network error while saving");
      setSubmitError(err.message || "Network error while saving");
    } finally {
      setSaving(false);
    }
  }

  // ---- status / delete ----
  async function doToggleStatus(zone) {
    if (!canStatus) {
      toast.error("You do not have permission to change status");
      return;
    }

    const newStatus = zone.status === 1 ? 0 : 1;
    setTogglingId(zone.id);
    const oldZones = [...zones];
    setZones((prev) => prev.map((z) => (z.id === zone.id ? { ...z, status: newStatus } : z)));
    try {
      const res = await api.post(`/zone/${zone.id}/status`, { status: newStatus });
      const json = await res.json();
      const appError = typeof json.status !== "undefined" && (json.status === 0 || json.status === "0");

      if (!res.ok || appError) {
        if (res.status === 401 || json.message === "Unauthorized") {
          setZones(oldZones);
          return;
        }
        setZones(oldZones);
        toast.error(json.message || "Failed to update status");
        return;
      }
      toast.success(newStatus === 1 ? "Activated" : "Deactivated");
    } catch (err) {
      setZones(oldZones);
      toast.error(err.message || "Network error updating status");
    } finally {
      setTogglingId(null);
    }
  }

  async function doDeleteZone(zone) {
    if (!canDelete) {
      toast.error("You do not have permission to delete zones");
      return;
    }

    try {
      const res = await api.delete(`/zone/${zone.id}`);
      const json = await res.json();
      if (!res.ok || json.status === 0) {
        if (res.status === 401 || json.message === "Unauthorized") return;
        toast.error(json.message || "Delete failed");
        return;
      }
      toast.success("Zone deleted");
      fetchZones({ page: 1, limit, search: "" });
    } catch (err) {
      toast.error(err.message || "Network error deleting zone");
    }
  }

  if (!canView) return <div className="p-10 text-center text-red-600 font-bold text-xl">Unauthorized</div>;

  return (
    <div className="p-6 mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Zones</h1>
          <p className="text-sm text-gray-500 mt-1">Manage zones mapped with corporations (state &amp; city from corporation).</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Show</label>
            <select value={limit} onChange={onLimitChange} className="border rounded px-2 py-1 text-sm">
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div>
            <input value={search} onChange={onSearchChange} placeholder="Search zones..." className="border rounded px-3 py-2 w-64" />
          </div>

          {canCreate && (
            <button onClick={openCreate} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded shadow">
              <Icon name="plus" /> Add Zone
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Zone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Corporation</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">State</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">City</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Created</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                    <Icon name="spinner" /> <span className="ml-2">Loading…</span>
                  </td>
                </tr>
              ) : zones.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500">No zones found</td>
                </tr>
              ) : (
                zones.map((z, idx) => {
                  const corp = z.corporation || {};
                  const stateName = (corp.state && corp.state.name) || (corp.State && corp.State.name) || "-";
                  const cityName = (corp.city && corp.city.name) || (corp.City && corp.City.name) || "-";

                  return (
                    <tr key={z.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700">{(meta.from || 0) + idx}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{z.name}</td>
                      <td className="px-4 py-3 text-gray-700">{corp.name || "-"}</td>
                      <td className="px-4 py-3 text-gray-700">{stateName}</td>
                      <td className="px-4 py-3 text-gray-700">{cityName}</td>
                      <td className="px-4 py-3 text-gray-700">{z.code || "-"}</td>
                      <td className="px-4 py-3">
                        {z.status === 1 ? <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Active</span> : <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Inactive</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{z.created_at ? new Date(z.created_at).toLocaleString() : "-"}</td>
                      <td className="px-4 py-3">
                        <div className="inline-flex items-center gap-2">
                          {canEdit && (
                            <button onClick={() => openEdit(z)} title="Edit" className="px-2 py-1 border rounded text-sm bg-white hover:bg-gray-50">
                              <Icon name="edit" />
                            </button>
                          )}
                          {canStatus && (
                            <button onClick={() => setConfirmAction({ type: "status", zone: z })} disabled={togglingId === z.id} className={`px-3 py-1 rounded text-xs font-medium ${z.status === 1 ? "bg-red-50 text-red-700 border" : "bg-emerald-50 text-emerald-700 border"}`}>
                              {togglingId === z.id ? <><Icon name="spinner" /> <span className="ml-2">...</span></> : z.status === 1 ? "Deactivate" : "Activate"}
                            </button>
                          )}
                          {canDelete && (
                            <button onClick={() => setConfirmAction({ type: "delete", zone: z })} className="px-2 py-1 border rounded text-sm bg-white hover:bg-gray-50 text-red-600">Delete</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
          <div className="text-sm text-gray-600">Showing {meta.from || 0} to {meta.to || 0} of {meta.total || 0}</div>
          <div className="flex items-center gap-2">
            <button onClick={() => goToPage(1)} disabled={page === 1} className="px-2 py-1 border rounded disabled:opacity-50">«</button>
            <button onClick={() => goToPage(page - 1)} disabled={page === 1} className="px-2 py-1 border rounded disabled:opacity-50">‹</button>
            {getPageNumbers().map((p) => (<button key={p} onClick={() => goToPage(p)} className={`px-3 py-1 border rounded ${p === page ? "bg-emerald-600 text-white" : "bg-white"}`}>{p}</button>))}
            <button onClick={() => goToPage(page + 1)} disabled={page === meta.totalPages || meta.totalPages === 0} className="px-2 py-1 border rounded disabled:opacity-50">›</button>
            <button onClick={() => goToPage(meta.totalPages || 1)} disabled={page === meta.totalPages || meta.totalPages === 0} className="px-2 py-1 border rounded disabled:opacity-50">»</button>
          </div>
        </div>
      </div>

      {/* Add / Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-16">
          <div className="fixed inset-0 bg-black opacity-40" onClick={() => { setShowModal(false); setEditingId(null); }} />
          <form onSubmit={doSave} className="relative z-60 bg-white rounded-lg shadow-xl w-full max-w-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{editingId ? "Edit Zone" : "Add Zone"}</h3>
              <button type="button" onClick={() => { setShowModal(false); setEditingId(null); }} className="text-gray-500">✕</button>
            </div>

            {submitError && <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{submitError}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <SearchableSelect label="State" options={states} value={form.state_id} onChange={(v) => setFormField("state_id", v)} placeholder="Select state" />
              <SearchableSelect label="City" options={cities} value={form.city_id} onChange={(v) => setFormField("city_id", v)} placeholder="Select city" disabled={!form.state_id} />
              <SearchableSelect label="Corporation" options={corporations} value={form.corporation_id} onChange={(v) => setFormField("corporation_id", v)} placeholder="Select corporation" disabled={!form.city_id} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Zone Name</label>
                <input value={form.name} onChange={(e) => setFormField("name", e.target.value)} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zone Code</label>
                <input value={form.code} onChange={(e) => setFormField("code", e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Z-01" />
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={Number(form.status) === 1} onChange={(e) => setFormField("status", e.target.checked ? 1 : 0)} className="w-4 h-4" />
                <span className="text-sm text-gray-700">Active</span>
              </label>

              <div className="flex items-center gap-2">
                <button type="button" onClick={() => { setShowModal(false); setEditingId(null); }} className="px-4 py-2 bg-gray-100 rounded">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-emerald-600 text-white rounded">
                  {saving ? (<><Icon name="spinner" /> <span className="ml-2">Saving…</span></>) : editingId ? "Update" : "Save"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        open={!!confirmAction}
        title={confirmAction?.type === "delete" ? "Delete zone?" : "Confirm status change"}
        message={confirmAction?.type === "delete" ? `Delete zone "${confirmAction.zone.name}"? This cannot be undone.` : `${confirmAction?.zone?.status === 1 ? "Deactivate" : "Activate"} zone "${confirmAction?.zone?.name}"?`}
        confirmText={confirmAction?.type === "delete" ? "Delete" : confirmAction?.zone?.status === 1 ? "Deactivate" : "Activate"}
        cancelText="Cancel"
        onConfirm={async () => {
          if (!confirmAction) return;
          const { type, zone } = confirmAction;
          setConfirmAction(null);
          if (type === "status") await doToggleStatus(zone);
          if (type === "delete") await doDeleteZone(zone);
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
