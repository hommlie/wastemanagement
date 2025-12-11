// adminFrontend/src/pages/DivisionsPage.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { can } from "../utils/permission";

/* ---------- Icons ---------- */
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

/* ---------- ConfirmModal ---------- */
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

/* ---------- SearchableSelect with accessibility fixes ----------
   - label htmlFor -> triggerId
   - internal search input has id + name
   - accepts name prop (for autofill / testing)
   - displayValue fallback for edit case
*/
function SearchableSelect({ name = "", label, options = [], value, onChange, placeholder = "Select...", disabled = false, displayValue = "" }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  // stable id for accessibility
  const idRef = useRef(`ss-${Math.random().toString(36).slice(2, 9)}`);
  const labelId = `${idRef.current}-label`;
  const triggerId = `${idRef.current}-trigger`;
  const searchInputId = `${idRef.current}-search`;

  useEffect(() => {
    function onDoc(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = options.filter((o) => String(o.name).toLowerCase().includes(query.toLowerCase()));
  const found = options.find((o) => String(o.id) === String(value));
  const labelToShow = found ? found.name : value && displayValue ? displayValue : "";

  return (
    <div ref={ref} className="relative">
      {label && (
        <label id={labelId} htmlFor={triggerId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <button
        id={triggerId}
        type="button"
        aria-labelledby={labelId}
        disabled={disabled}
        onClick={() => !disabled && setOpen((s) => !s)}
        className={`w-full text-left px-3 py-2 border rounded-md shadow-sm bg-white flex items-center justify-between ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <span className={`truncate ${labelToShow ? "text-gray-900" : "text-gray-500"}`}>{labelToShow || placeholder}</span>
        <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="none">
          <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && !disabled && (
        <div className="absolute left-0 right-0 mt-2 z-40 bg-white border rounded-md shadow-lg">
          <div className="p-2">
            <input
              id={searchInputId}
              name={name ? `${name}_search` : `${idRef.current}_search`}
              aria-label={`Search ${label || "options"}`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to search..."
              className="w-full border rounded px-3 py-2 text-sm"
              autoFocus
            />
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
            <button type="button" onClick={() => { onChange(""); setOpen(false); setQuery(""); }} className="text-xs text-gray-500 mr-2">Clear</button>
            <button type="button" onClick={() => setOpen(false)} className="text-xs text-gray-500">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Main Divisions Page component ---------- */
export default function DivisionsPage() {
  const [divisions, setDivisions] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 0, from: 0, to: 0 });
  const [loading, setLoading] = useState(false);

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [corporations, setCorporations] = useState([]);
  const [zones, setZones] = useState([]);

  // fallback display names for selects when options don't yet contain the selected id
  const [selectedCityName, setSelectedCityName] = useState("");
  const [selectedCorporationName, setSelectedCorporationName] = useState("");
  const [selectedZoneName, setSelectedZoneName] = useState("");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ state_id: "", city_id: "", corporation_id: "", zone_id: "", name: "", status: 1 });
  const [submitError, setSubmitError] = useState(null);

  const [confirmAction, setConfirmAction] = useState(null);
  const searchTimerRef = useRef(null);

  const canView = can("division", "view");
  const canCreate = can("division", "create");
  const canEdit = can("division", "edit");
  const canDelete = can("division", "delete");
  const canStatus = can("division", "status");

  const setFormField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  /* ---------- API helpers (frontend calls backend endpoints below) ---------- */
  const fetchStates = useCallback(async () => {
    try {
      const res = await api.get("/division/states");
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
      const res = await api.get(`/division/cities/${stateId}`);
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

  const fetchCorporations = useCallback(async (cityId) => {
    if (!cityId) {
      setCorporations([]);
      return [];
    }
    try {
      const res = await api.get(`/division/corporations/${cityId}`);
      const json = await res.json();
      if (res.ok && json.status === 1) {
        setCorporations(json.data || []);
        return json.data || [];
      }
    } catch (err) {
      // ignore
    }
    setCorporations([]);
    return [];
  }, []);

  const fetchZones = useCallback(async (corporationId) => {
    if (!corporationId) {
      setZones([]);
      return [];
    }
    try {
      const res = await api.get(`/division/zones/${corporationId}`);
      const json = await res.json();
      if (res.ok && json.status === 1) {
        setZones(json.data || []);
        return json.data || [];
      }
    } catch (err) {
      // ignore
    }
    setZones([]);
    return [];
  }, []);

  /* ---------- fetch divisions list ---------- */
  const fetchDivisions = useCallback(
    async (opts = {}) => {
      if (!canView) return;
      const qPage = opts.page ?? page;
      const qLimit = opts.limit ?? limit;
      const qSearch = typeof opts.search !== "undefined" ? opts.search : search;
      const qZoneId = opts.zone_id ?? "";

      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: qPage,
          limit: qLimit,
          search: qSearch || "",
        });
        if (qZoneId) params.set("zone_id", qZoneId);

        const res = await api.get(`/division?${params.toString()}`);
        const json = await res.json();

        if (res.ok && (json.status === 1 || typeof json.status === "undefined")) {
          const list = json.data || [];
          const metaData = json.meta || {
            total: list.length,
            page: qPage,
            limit: qLimit,
            totalPages: 1,
            from: list.length ? 1 : 0,
            to: list.length,
          };
          setDivisions(list);
          setMeta(metaData);
          setPage(metaData.page || qPage);
          setLimit(metaData.limit || qLimit);
        } else {
          toast.error(json.message || "Failed to load divisions");
        }
      } catch (err) {
        toast.error(err.message || "Network error while fetching divisions");
      } finally {
        setLoading(false);
      }
    },
    [page, limit, search, canView]
  );

  useEffect(() => {
    if (!canView) return;
    fetchStates();
    fetchDivisions({ page: 1, limit: 10 });
  }, [canView, fetchStates, fetchDivisions]);

  /* ---------- cascade behaviour ---------- */
  useEffect(() => {
    if (form.state_id) {
      fetchCities(form.state_id);
    } else {
      setCities([]);
    }
    setForm((p) => ({ ...p, city_id: "", corporation_id: "", zone_id: "" }));
    setCorporations([]);
    setZones([]);
    setSelectedCityName("");
    setSelectedCorporationName("");
    setSelectedZoneName("");
  }, [form.state_id, fetchCities]);

  useEffect(() => {
    if (form.city_id) {
      fetchCorporations(form.city_id);
    } else {
      setCorporations([]);
    }
    setForm((p) => ({ ...p, corporation_id: "", zone_id: "" }));
    setZones([]);
    setSelectedCorporationName("");
    setSelectedZoneName("");
  }, [form.city_id, fetchCorporations]);

  useEffect(() => {
    if (form.corporation_id) {
      fetchZones(form.corporation_id);
    } else {
      setZones([]);
    }
    setForm((p) => ({ ...p, zone_id: "" }));
    setSelectedZoneName("");
  }, [form.corporation_id, fetchZones]);

  /* ---------- search / pagination ---------- */
  function onSearchChange(e) {
    const v = e.target.value;
    setSearch(v);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      fetchDivisions({ page: 1, limit, search: v });
      searchTimerRef.current = null;
    }, 400);
  }

  const onLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10) || 10;
    setLimit(newLimit);
    fetchDivisions({ page: 1, limit: newLimit, search });
  };

  const goToPage = (p) => {
    if (p < 1 || p > (meta.totalPages || 1)) return;
    fetchDivisions({ page: p, limit, search });
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

  /* ---------- Add / Edit ---------- */
  function openCreate() {
    if (!canCreate) {
      toast.error("You do not have permission to create divisions");
      return;
    }
    setEditingId(null);
    setForm({ state_id: "", city_id: "", corporation_id: "", zone_id: "", name: "", status: 1 });
    setCities([]);
    setCorporations([]);
    setZones([]);
    setSelectedCityName("");
    setSelectedCorporationName("");
    setSelectedZoneName("");
    setSubmitError(null);
    setShowModal(true);
  }

  // openEdit uses displayName fallbacks returned by backend or nested objects
  async function openEdit(row) {
    if (!canEdit) {
      toast.error("You do not have permission to edit divisions");
      return;
    }

    setEditingId(row.id);
    setSubmitError(null);

    // reset display fallbacks
    setSelectedCityName("");
    setSelectedCorporationName("");
    setSelectedZoneName("");

    try {
      const res = await api.get(`/division/${row.id}`);
      const json = await res.json();

      if (res.ok && json && json.status === 1 && json.data) {
        const payload = json.data;
        const division = payload.division || payload;
        const helpers = payload.helpers || {};

        // set lists if provided
        if (Array.isArray(helpers.states) && helpers.states.length) setStates(helpers.states);
        if (Array.isArray(helpers.cities) && helpers.cities.length) setCities(helpers.cities);
        if (Array.isArray(helpers.corporations) && helpers.corporations.length) setCorporations(helpers.corporations);
        if (Array.isArray(helpers.zones) && helpers.zones.length) setZones(helpers.zones);

        // choose ids (helpers preferred, fallback to nested objects)
        const stateId = helpers.state_id ?? (division.state_id ?? "");
        const cityId = helpers.city_id ?? (division.city_id ?? "");
        const corporationId = helpers.corporation_id ?? (division.corporation_id ?? (division.zone && division.zone.corporation_id ? division.zone.corporation_id : ""));
        const zoneId = division.zone_id ?? (division.zone && division.zone.id ? division.zone.id : "");

        // set display names from helpers or nested objects (so UI shows name immediately)
        let cityName = "";
        let corpName = "";
        let zoneName = "";

        if (helpers.cities && helpers.cities.length && cityId) {
          const c = helpers.cities.find((x) => String(x.id) === String(cityId));
          if (c) cityName = c.name;
        }
        if (!cityName && division.city_name) cityName = division.city_name;

        if (helpers.corporations && helpers.corporations.length && corporationId) {
          const c = helpers.corporations.find((x) => String(x.id) === String(corporationId));
          if (c) corpName = c.name;
        }
        if (!corpName && division.corporation_name) corpName = division.corporation_name;
        if (!corpName && division.zone && division.zone.corporation_name) corpName = division.zone.corporation_name;

        if (helpers.zones && helpers.zones.length && zoneId) {
          const z = helpers.zones.find((x) => String(x.id) === String(zoneId));
          if (z) zoneName = z.name;
        }
        if (!zoneName && division.zone && division.zone.name) zoneName = division.zone.name;

        // set the form ids (strings)
        setForm({
          state_id: stateId ? String(stateId) : "",
          city_id: cityId ? String(cityId) : "",
          corporation_id: corporationId ? String(corporationId) : "",
          zone_id: zoneId ? String(zoneId) : "",
          name: division.name || "",
          status: division.status ?? 1,
        });

        // set the display fallback names
        setSelectedCityName(cityName || "");
        setSelectedCorporationName(corpName || "");
        setSelectedZoneName(zoneName || "");

        // ensure we have options arrays for the selects (if not included, fetch them)
        if (stateId && (!helpers.cities || helpers.cities.length === 0)) {
          await fetchCities(stateId);
        }
        if (cityId && (!helpers.corporations || helpers.corporations.length === 0)) {
          await fetchCorporations(cityId);
        }
        if (corporationId && (!helpers.zones || helpers.zones.length === 0)) {
          await fetchZones(corporationId);
        }
      } else {
        // fallback to row data
        setForm({
          state_id: "",
          city_id: "",
          corporation_id: row.zone && row.zone.corporation_id ? String(row.zone.corporation_id) : "",
          zone_id: row.zone_id ? String(row.zone_id) : "",
          name: row.name || "",
          status: row.status ?? 1,
        });

        // fallback display names if available in row
        if (row.zone && row.zone.name) setSelectedZoneName(row.zone.name);
        // fetch zones if we have corporation id
        if (row.zone && row.zone.corporation_id) {
          await fetchZones(row.zone.corporation_id);
        }
      }
    } catch (err) {
      // fallback minimal
      setForm({
        state_id: "",
        city_id: "",
        corporation_id: row.zone && row.zone.corporation_id ? String(row.zone.corporation_id) : "",
        zone_id: row.zone_id ? String(row.zone_id) : "",
        name: row.name || "",
        status: row.status ?? 1,
      });
      if (row.zone && row.zone.name) setSelectedZoneName(row.zone.name);
    }

    setShowModal(true);
  }

  async function doSave(e) {
    e.preventDefault();
    setSubmitError(null);

    if (!form.zone_id || !form.name.trim()) {
      toast.error("Zone and division name are required");
      return;
    }

    if (editingId && !canEdit) {
      toast.error("You do not have permission to update divisions");
      return;
    }
    if (!editingId && !canCreate) {
      toast.error("You do not have permission to create divisions");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        zone_id: parseInt(form.zone_id, 10),
        name: form.name.trim(),
        status: form.status,
      };

      const res = editingId ? await api.put(`/division/${editingId}`, payload) : await api.post("/division", payload);
      const json = await res.json();

      const appError = typeof json.status !== "undefined" && (json.status === 0 || json.status === "0");

      if (!res.ok || appError) {
        if (res.status === 401 || json.message === "Unauthorized") return;
        const msg = json.message || "Save failed";
        toast.error(msg);
        setSubmitError(msg);
        return;
      }

      toast.success(editingId ? "Division updated" : "Division created");
      setShowModal(false);
      setEditingId(null);
      setForm({ state_id: "", city_id: "", corporation_id: "", zone_id: "", name: "", status: 1 });
      setSelectedCityName("");
      setSelectedCorporationName("");
      setSelectedZoneName("");
      fetchDivisions({ page: 1, limit, search: "" });
    } catch (err) {
      toast.error(err.message || "Network error while saving");
      setSubmitError(err.message || "Network error while saving");
    } finally {
      setSaving(false);
    }
  }

  /* ---------- status / delete ---------- */
  async function doToggleStatus(division) {
    if (!canStatus) {
      toast.error("You do not have permission to change status");
      return;
    }

    const newStatus = division.status === 1 ? 0 : 1;

    try {
      const res = await api.post(`/division/${division.id}/status`, { status: newStatus });
      const json = await res.json();
      if (!res.ok || (json.status === 0 || json.status === "0")) {
        toast.error(json.message || "Failed to update status");
        return;
      }
      toast.success(newStatus === 1 ? "Activated" : "Deactivated");
      fetchDivisions({ page, limit, search });
    } catch (err) {
      toast.error(err.message || "Network error updating status");
    }
  }

  async function doDelete(division) {
    if (!canDelete) {
      toast.error("You do not have permission to delete divisions");
      return;
    }

    try {
      const res = await api.delete(`/division/${division.id}`);
      const json = await res.json();
      if (!res.ok || json.status === 0) {
        toast.error(json.message || "Delete failed");
        return;
      }
      toast.success("Division deleted");
      fetchDivisions({ page: 1, limit, search: "" });
    } catch (err) {
      toast.error(err.message || "Network error deleting division");
    }
  }

  /* ---------- Render UI ---------- */
  if (!canView) {
    return <div className="p-10 text-center text-red-600 font-bold text-xl">Unauthorized</div>;
  }

  return (
    <div className="p-6 mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Divisions</h1>
          <p className="text-sm text-gray-500 mt-1">Manage divisions mapped with zones (choose State → City → Corporation → Zone).</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="divisions-limit" className="text-sm text-gray-600">Show</label>
            <select id="divisions-limit" name="divisions_limit" value={limit} onChange={onLimitChange} className="border rounded px-2 py-1 text-sm">
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div>
            <label htmlFor="divisions-search" className="sr-only">Search divisions</label>
            <input id="divisions-search" name="divisions_search" value={search} onChange={onSearchChange} placeholder="Search divisions..." className="border rounded px-3 py-2 w-64" />
          </div>

          {canCreate && (
            <button onClick={openCreate} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded shadow">
              <Icon name="plus" /> Add Division
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Division</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Zone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Created</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    <Icon name="spinner" /> <span className="ml-2">Loading…</span>
                  </td>
                </tr>
              ) : divisions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">No divisions found</td>
                </tr>
              ) : (
                divisions.map((d, idx) => (
                  <tr key={d.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">{(meta.from || 0) + idx}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{d.name}</td>
                    <td className="px-4 py-3 text-gray-700">{(d.zone && d.zone.name) || "-"}</td>
                    <td className="px-4 py-3">
                      {d.status === 1 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Active</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Inactive</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{d.created_at ? new Date(d.created_at).toLocaleString() : "-"}</td>
                    <td className="px-4 py-3">
                      <div className="inline-flex items-center gap-2">
                        {canEdit && (
                          <button onClick={() => openEdit(d)} title="Edit" className="px-2 py-1 border rounded text-sm bg-white hover:bg-gray-50">
                            <Icon name="edit" />
                          </button>
                        )}
                        {canStatus && (
                          <button onClick={() => setConfirmAction({ type: "status", division: d })} className={`px-3 py-1 rounded text-xs font-medium ${d.status === 1 ? "bg-red-50 text-red-700 border" : "bg-emerald-50 text-emerald-700 border"}`}>
                            {d.status === 1 ? "Deactivate" : "Activate"}
                          </button>
                        )}
                        {canDelete && (
                          <button onClick={() => setConfirmAction({ type: "delete", division: d })} className="px-2 py-1 border rounded text-sm bg-white hover:bg-gray-50 text-red-600">
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
          <div className="text-sm text-gray-600">Showing {meta.from || 0} to {meta.to || 0} of {meta.total || 0}</div>
          <div className="flex items-center gap-2">
            <button onClick={() => goToPage(1)} disabled={page === 1} className="px-2 py-1 border rounded disabled:opacity-50">«</button>
            <button onClick={() => goToPage(page - 1)} disabled={page === 1} className="px-2 py-1 border rounded disabled:opacity-50">‹</button>
            {getPageNumbers().map((p) => (
              <button key={p} onClick={() => goToPage(p)} className={`px-3 py-1 border rounded ${p === page ? "bg-emerald-600 text-white" : "bg-white"}`}>{p}</button>
            ))}
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
              <h3 className="text-lg font-medium text-gray-900">{editingId ? "Edit Division" : "Add Division"}</h3>
              <button type="button" onClick={() => { setShowModal(false); setEditingId(null); }} className="text-gray-500">✕</button>
            </div>

            {submitError && <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{submitError}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <SearchableSelect name="division_state" label="State" options={states} value={form.state_id} onChange={(v) => setFormField("state_id", v)} placeholder="Select state" />
              <SearchableSelect name="division_city" label="City" options={cities} value={form.city_id} onChange={(v) => {
                // find and set display name when user selects from options
                const sel = cities.find((c) => String(c.id) === String(v));
                if (sel) setSelectedCityName(sel.name);
                setFormField("city_id", v);
              }} placeholder="Select city" disabled={!form.state_id} displayValue={selectedCityName} />
              <SearchableSelect name="division_corporation" label="Corporation" options={corporations} value={form.corporation_id} onChange={(v) => {
                const sel = corporations.find((c) => String(c.id) === String(v));
                if (sel) setSelectedCorporationName(sel.name);
                setFormField("corporation_id", v);
              }} placeholder="Select corporation" disabled={!form.city_id} displayValue={selectedCorporationName} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <SearchableSelect name="division_zone" label="Zone" options={zones} value={form.zone_id} onChange={(v) => {
                const sel = zones.find((z) => String(z.id) === String(v));
                if (sel) setSelectedZoneName(sel.name);
                setFormField("zone_id", v);
              }} placeholder="Select zone" disabled={!form.corporation_id} displayValue={selectedZoneName} />
              <div className="sm:col-span-2">
                <label htmlFor="division-name" className="block text-sm font-medium text-gray-700 mb-1">Division Name</label>
                <input id="division-name" name="division_name" value={form.name} onChange={(e) => setFormField("name", e.target.value)} className="w-full border rounded px-3 py-2" required />
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <div>
                <input id="division-status" name="division_status" type="checkbox" checked={Number(form.status) === 1} onChange={(e) => setFormField("status", e.target.checked ? 1 : 0)} className="w-4 h-4" />
                <label htmlFor="division-status" className="ml-2 text-sm text-gray-700">Active</label>
              </div>

              <div className="flex items-center gap-2">
                <button type="button" onClick={() => { setShowModal(false); setEditingId(null); }} className="px-4 py-2 bg-gray-100 rounded">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-emerald-600 text-white rounded">
                  {saving ? (
                    <>
                      <Icon name="spinner" /> <span className="ml-2">Saving…</span>
                    </>
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

      {/* Confirm modal */}
      <ConfirmModal
        open={!!confirmAction}
        title={confirmAction?.type === "delete" ? "Delete division?" : "Confirm status change"}
        message={
          confirmAction?.type === "delete"
            ? `Delete division "${confirmAction?.division?.name}"? This cannot be undone.`
            : `${confirmAction?.division?.status === 1 ? "Deactivate" : "Activate"} division "${confirmAction?.division?.name}"?`
        }
        confirmText={confirmAction?.type === "delete" ? "Delete" : confirmAction?.division?.status === 1 ? "Deactivate" : "Activate"}
        cancelText="Cancel"
        onConfirm={async () => {
          if (!confirmAction) return;
          const { type, division } = confirmAction;
          setConfirmAction(null);
          if (type === "status") await doToggleStatus(division);
          if (type === "delete") await doDelete(division);
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
