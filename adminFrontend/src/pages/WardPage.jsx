// adminFrontend/src/pages/WardsPage.jsx
// adminFrontend/src/pages/WardsPage.jsx
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

/* ---------- SearchableSelect (accessible, same behavior as DivisionsPage) ---------- */
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

/* ========================= WardsPage component ========================= */
/* ========================= WardsPage component (full) ========================= */
export default function WardsPage() {
  const [wards, setWards] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 0, from: 0, to: 0 });
  const [loading, setLoading] = useState(false);

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [corporations, setCorporations] = useState([]);
  const [zones, setZones] = useState([]);
  const [divisions, setDivisions] = useState([]);

  // for display fallback when editing but option lists not loaded yet
  const [selectedCityName, setSelectedCityName] = useState("");
  const [selectedCorporationName, setSelectedCorporationName] = useState("");
  const [selectedZoneName, setSelectedZoneName] = useState("");
  const [selectedDivisionName, setSelectedDivisionName] = useState("");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    state_id: "",
    city_id: "",
    corporation_id: "",
    zone_id: "",
    division_id: "",
    name: "",
    status: 1,
  });

  const [pincodes, setPincodes] = useState([]); // pincodes for selected ward in modal
  const [newPincode, setNewPincode] = useState("");

  const [confirmAction, setConfirmAction] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const searchTimerRef = useRef(null);

  const canView = can("ward", "view");
  const canCreate = can("ward", "create");
  const canEdit = can("ward", "edit");
  const canDelete = can("ward", "delete");
  const canStatus = can("ward", "status");

  const setFormField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  /* ----------------- API helpers ----------------- */

  // states
  const fetchStates = useCallback(async () => {
    try {
      const res = await api.get("/ward/states");
      const json = await res.json();
      if (res.ok && json.status === 1) setStates(json.data || []);
    } catch (err) {
      toast.error(err.message || "Failed to load states");
    }
  }, []);

  // cities
  const fetchCities = useCallback(async (stateId) => {
    if (!stateId) {
      setCities([]);
      return [];
    }
    try {
      const res = await api.get(`/ward/cities/${stateId}`);
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

  // corporations
  const fetchCorporations = useCallback(async (cityId) => {
    if (!cityId) {
      setCorporations([]);
      return [];
    }
    try {
      const res = await api.get(`/ward/corporations/${cityId}`);
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

  // zones
  const fetchZones = useCallback(async (corporationId) => {
    if (!corporationId) {
      setZones([]);
      return [];
    }
    try {
      const res = await api.get(`/ward/zones/${corporationId}`);
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

  // divisions for zone
  const fetchDivisionsForZone = useCallback(async (zoneId) => {
    if (!zoneId) {
      setDivisions([]);
      return [];
    }
    try {
      const res = await api.get(`/ward/divisions/${zoneId}`);
      const json = await res.json();
      if (res.ok && json.status === 1) {
        setDivisions(json.data || []);
        return json.data || [];
      }
    } catch (err) {
      // ignore
    }
    setDivisions([]);
    return [];
  }, []);

  /* ----------------- fetch wards (list) ----------------- */
  const fetchWards = useCallback(
    async (opts = {}) => {
      if (!canView) return;
      const qPage = opts.page ?? page;
      const qLimit = opts.limit ?? limit;
      const qSearch = typeof opts.search !== "undefined" ? opts.search : search;
      const qDivisionId = opts.division_id ?? "";

      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: qPage,
          limit: qLimit,
          search: qSearch || "",
        });
        if (qDivisionId) params.set("division_id", qDivisionId);

        const res = await api.get(`/ward?${params.toString()}`);
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
          setWards(list);
          setMeta(metaData);
          setPage(metaData.page || qPage);
          setLimit(metaData.limit || qLimit);
        } else {
          if (json.message === "Unauthorized") return;
          toast.error(json.message || "Failed to load wards");
        }
      } catch (err) {
        toast.error(err.message || "Network error while fetching wards");
      } finally {
        setLoading(false);
      }
    },
    [page, limit, search, canView]
  );

  useEffect(() => {
    if (!canView) return;
    fetchStates();
    fetchWards({ page: 1, limit: 10 });
  }, [canView, fetchStates, fetchWards]);

  /* ----------------- cascade dropdown behaviour ----------------- */

  useEffect(() => {
    if (form.state_id) {
      fetchCities(form.state_id);
    } else {
      setCities([]);
    }
    setForm((p) => ({ ...p, city_id: "", corporation_id: "", zone_id: "", division_id: "" }));
    setCorporations([]);
    setZones([]);
    setDivisions([]);
    setSelectedCityName("");
    setSelectedCorporationName("");
    setSelectedZoneName("");
    setSelectedDivisionName("");
  }, [form.state_id, fetchCities]);

  useEffect(() => {
    if (form.city_id) {
      fetchCorporations(form.city_id);
    } else {
      setCorporations([]);
    }
    setForm((p) => ({ ...p, corporation_id: "", zone_id: "", division_id: "" }));
    setZones([]);
    setDivisions([]);
    setSelectedCorporationName("");
    setSelectedZoneName("");
    setSelectedDivisionName("");
  }, [form.city_id, fetchCorporations]);

  useEffect(() => {
    if (form.corporation_id) {
      fetchZones(form.corporation_id);
    } else {
      setZones([]);
    }
    setForm((p) => ({ ...p, zone_id: "", division_id: "" }));
    setDivisions([]);
    setSelectedZoneName("");
    setSelectedDivisionName("");
  }, [form.corporation_id, fetchZones]);

  useEffect(() => {
    if (form.zone_id) {
      fetchDivisionsForZone(form.zone_id);
    } else {
      setDivisions([]);
    }
    setForm((p) => ({ ...p, division_id: "" }));
    setSelectedDivisionName("");
  }, [form.zone_id, fetchDivisionsForZone]);

  /* ----------------- search / pagination ----------------- */

  function onSearchChange(e) {
    const v = e.target.value;
    setSearch(v);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      fetchWards({ page: 1, limit, search: v });
      searchTimerRef.current = null;
    }, 400);
  }

  const onLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10) || 10;
    setLimit(newLimit);
    fetchWards({ page: 1, limit: newLimit, search });
  };

  const goToPage = (p) => {
    if (p < 1 || p > (meta.totalPages || 1)) return;
    fetchWards({ page: p, limit, search });
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

  /* ----------------- add / edit logic ----------------- */

  function openCreate() {
    if (!canCreate) {
      toast.error("You do not have permission to create wards");
      return;
    }
    setEditingId(null);
    setForm({ state_id: "", city_id: "", corporation_id: "", zone_id: "", division_id: "", name: "", status: 1 });
    setPincodes([]);
    setNewPincode("");
    setSelectedCityName("");
    setSelectedCorporationName("");
    setSelectedZoneName("");
    setSelectedDivisionName("");
    setShowModal(true);
  }

  async function ensureListsAndSetForm({ stateId, cityId, corporationId, zoneId, divisionId, ward }) {
    try {
      if (stateId && !cities.some((c) => String(c.id) === String(cityId))) {
        await fetchCities(stateId);
      }
      if (cityId && !corporations.some((c) => String(c.id) === String(corporationId))) {
        await fetchCorporations(cityId);
      }
      if (corporationId && !zones.some((z) => String(z.id) === String(zoneId))) {
        await fetchZones(corporationId);
      }
      if (zoneId && !divisions.some((d) => String(d.id) === String(divisionId))) {
        await fetchDivisionsForZone(zoneId);
      }
    } catch (e) {
      // ignore
    }

    setForm({
      state_id: stateId ? String(stateId) : "",
      city_id: cityId ? String(cityId) : "",
      corporation_id: corporationId ? String(corporationId) : "",
      zone_id: zoneId ? String(zoneId) : "",
      division_id: divisionId ? String(divisionId) : "",
      name: ward.name || "",
      status: ward.status ?? 1,
    });
  }

  async function openEdit(row) {
    if (!canEdit) {
      toast.error("You do not have permission to edit wards");
      return;
    }

    setEditingId(row.id);
    setPincodes([]);
    setNewPincode("");
    setSelectedCityName("");
    setSelectedCorporationName("");
    setSelectedZoneName("");
    setSelectedDivisionName("");
    setForm((p) => ({ ...p }));

    try {
      const res = await api.get(`/ward/${row.id}`);
      const json = await res.json();

      if (res.ok && json && json.status === 1 && json.data) {
        const payload = json.data;
        const wardPayload = payload.ward || payload;
        const helpers = payload.helpers || {};

        if (Array.isArray(helpers.states) && helpers.states.length) setStates(helpers.states);
        if (Array.isArray(helpers.cities) && helpers.cities.length) setCities(helpers.cities);
        if (Array.isArray(helpers.corporations) && helpers.corporations.length) setCorporations(helpers.corporations);
        if (Array.isArray(helpers.zones) && helpers.zones.length) setZones(helpers.zones);
        if (Array.isArray(helpers.divisions) && helpers.divisions.length) setDivisions(helpers.divisions);

        const stateId = payload.state_id ?? "";
        const cityId = payload.city_id ?? "";
        const corporationId = payload.corporation_id ?? "";
        const zoneId = payload.zone_id ?? "";
        const divisionId = wardPayload.division_id ?? (wardPayload.division && wardPayload.division.id ? wardPayload.division.id : "");

        // set display fallback names
        let cityName = "";
        let corpName = "";
        let zoneName = "";
        let divisionName = "";

        if (helpers.cities && helpers.cities.length && cityId) {
          const c = helpers.cities.find((x) => String(x.id) === String(cityId));
          if (c) cityName = c.name;
        }
        if (!cityName && payload.city_name) cityName = payload.city_name;

        if (helpers.corporations && helpers.corporations.length && corporationId) {
          const c = helpers.corporations.find((x) => String(x.id) === String(corporationId));
          if (c) corpName = c.name;
        }
        if (!corpName && payload.corporation_name) corpName = payload.corporation_name;

        if (helpers.zones && helpers.zones.length && zoneId) {
          const z = helpers.zones.find((x) => String(x.id) === String(zoneId));
          if (z) zoneName = z.name;
        }
        if (!zoneName && wardPayload.zone && wardPayload.zone.name) zoneName = wardPayload.zone.name;

        if (helpers.divisions && helpers.divisions.length && divisionId) {
          const d = helpers.divisions.find((x) => String(x.id) === String(divisionId));
          if (d) divisionName = d.name;
        }
        if (!divisionName && wardPayload.division && wardPayload.division.name) divisionName = wardPayload.division.name;

        setSelectedCityName(cityName);
        setSelectedCorporationName(corpName);
        setSelectedZoneName(zoneName);
        setSelectedDivisionName(divisionName);

        await ensureListsAndSetForm({
          stateId,
          cityId,
          corporationId,
          zoneId,
          divisionId,
          ward: wardPayload,
        });

        // load pincodes for this ward
        await loadPincodes(row.id);
      } else {
        // fallback if backend didn't return helpers
        const divisionObj = row.division || {};
        const zoneObj = divisionObj.zone || {};
        const corpId = zoneObj.corporation_id ?? "";
        setForm({
          state_id: "",
          city_id: "",
          corporation_id: String(corpId || ""),
          zone_id: String(zoneObj.id || ""),
          division_id: String(divisionObj.id || (row.division_id || "")),
          name: row.name || "",
          status: row.status ?? 1,
        });

        if (corpId) await fetchZones(corpId);
        if (zoneObj.id) await fetchDivisionsForZone(zoneObj.id);
        if (divisionObj && divisionObj.name) setSelectedDivisionName(divisionObj.name);

        await loadPincodes(row.id);
      }
    } catch (err) {
      // minimal fallback behavior
      setForm({
        state_id: "",
        city_id: "",
        corporation_id: "",
        zone_id: "",
        division_id: row.division_id ? String(row.division_id) : "",
        name: row.name || "",
        status: row.status ?? 1,
      });
      if (row.division && row.division.name) setSelectedDivisionName(row.division.name);
      try {
        await loadPincodes(row.id);
      } catch {}
    }

    setShowModal(true);
  }

  async function doSave(e) {
    e.preventDefault();
    if (!form.division_id || !form.name.trim()) {
      toast.error("Division and ward name are required");
      return;
    }
    if (editingId && !canEdit) {
      toast.error("You do not have permission to update wards");
      return;
    }
    if (!editingId && !canCreate) {
      toast.error("You do not have permission to create wards");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        division_id: parseInt(form.division_id, 10),
        name: form.name.trim(),
        status: form.status,
      };

      const res = editingId ? await api.put(`/ward/${editingId}`, payload) : await api.post("/ward", payload);
      const json = await res.json();

      const appError = typeof json.status !== "undefined" && (json.status === 0 || json.status === "0");
      if (!res.ok || appError) {
        if (res.status === 401 || json.message === "Unauthorized") return;
        const msg = json.message || "Save failed";
        toast.error(msg);
        return;
      }

      toast.success(editingId ? "Ward updated" : "Ward created");
      setShowModal(false);
      setEditingId(null);
      setForm({ state_id: "", city_id: "", corporation_id: "", zone_id: "", division_id: "", name: "", status: 1 });
      setPincodes([]);
      setNewPincode("");
      fetchWards({ page: 1, limit, search: "" });
    } catch (err) {
      toast.error(err.message || "Network error while saving");
    } finally {
      setSaving(false);
    }
  }

  /* ----------------- status / delete ----------------- */

  async function doToggleStatus(ward) {
    if (!canStatus) {
      toast.error("You do not have permission to change status");
      return;
    }

    const newStatus = ward.status === 1 ? 0 : 1;
    setTogglingId(ward.id);
    const old = [...wards];
    setWards((prev) => prev.map((w) => (w.id === ward.id ? { ...w, status: newStatus } : w)));

    try {
      const res = await api.post(`/ward/${ward.id}/status`, { status: newStatus });
      const json = await res.json();
      const appError = typeof json.status !== "undefined" && (json.status === 0 || json.status === "0");
      if (!res.ok || appError) {
        setWards(old);
        if (res.status === 401 || json.message === "Unauthorized") return;
        toast.error(json.message || "Failed to update status");
        return;
      }
      toast.success(newStatus === 1 ? "Activated" : "Deactivated");
    } catch (err) {
      setWards(old);
      toast.error(err.message || "Network error updating status");
    } finally {
      setTogglingId(null);
    }
  }

  async function doDeleteWard(ward) {
    if (!canDelete) {
      toast.error("You do not have permission to delete wards");
      return;
    }

    try {
      const res = await api.delete(`/ward/${ward.id}`);
      const json = await res.json();
      if (!res.ok || json.status === 0) {
        if (res.status === 401 || json.message === "Unauthorized") return;
        toast.error(json.message || "Delete failed");
        return;
      }
      toast.success("Ward deleted");
      fetchWards({ page: 1, limit, search: "" });
    } catch (err) {
      toast.error(err.message || "Network error deleting ward");
    }
  }

  /* ----------------- pincode manager ----------------- */

  async function loadPincodes(wardId) {
    try {
      const res = await api.get(`/ward/${wardId}/pincodes`);
      const json = await res.json();
      if (res.ok && json.status === 1) {
        setPincodes(json.data || []);
      } else {
        setPincodes([]);
      }
    } catch (err) {
      setPincodes([]);
    }
  }

  async function addPincode(wardId) {
    if (!newPincode || !newPincode.trim()) {
      toast.error("Enter a pincode");
      return;
    }
    if (!wardId) {
      toast.error("You can add pincodes only in edit mode (after saving ward)");
      return;
    }
    try {
      const res = await api.post(`/ward/${wardId}/pincode`, { pincode: newPincode.trim() });
      const json = await res.json();
      if (!res.ok || json.status === 0) {
        toast.error(json.message || "Failed to add pincode");
        return;
      }
      setNewPincode("");
      await loadPincodes(wardId);
      toast.success("Pincode added");
    } catch (err) {
      toast.error(err.message || "Network error adding pincode");
    }
  }

  async function deletePincode(pincodeItem) {
    try {
      const res = await api.delete(`/ward/pincode/${pincodeItem.id}`);
      const json = await res.json();
      if (!res.ok || json.status === 0) {
        toast.error(json.message || "Failed to remove pincode");
        return;
      }
      await loadPincodes(pincodeItem.ward_id);
      toast.success("Pincode removed");
    } catch (err) {
      toast.error(err.message || "Network error removing pincode");
    }
  }

  /* ----------------- Render (same as your original but using this logic) ----------------- */
  // The JSX return block is included below — paste Part C to complete file.
  return (
    <div className="p-6 mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Wards</h1>
          <p className="text-sm text-gray-500 mt-1">Manage wards (choose State → City → Corporation → Zone → Division).</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="wards-limit" className="text-sm text-gray-600">Show</label>
            <select id="wards-limit" name="wards_limit" value={limit} onChange={onLimitChange} className="border rounded px-2 py-1 text-sm">
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div>
            <label htmlFor="wards-search" className="sr-only">Search</label>
            <input id="wards-search" name="wards_search" value={search} onChange={onSearchChange} placeholder="Search wards..." className="border rounded px-3 py-2 w-64" />
          </div>

          {canCreate && (
            <button onClick={openCreate} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded shadow">
              <Icon name="plus" /> Add Ward
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Ward</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Division</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Zone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Corporation</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Created</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500"><Icon name="spinner" /> <span className="ml-2">Loading…</span></td>
                </tr>
              ) : wards.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">No wards found</td>
                </tr>
              ) : (
                wards.map((w, idx) => {
                  const divObj = w.division || {};
                  const zoneObj = divObj.zone || {};
                  const corpId = zoneObj.corporation_id;
                  return (
                    <tr key={w.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700">{(meta.from || 0) + idx}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{w.name}</td>
                      <td className="px-4 py-3 text-gray-700">{(divObj && divObj.name) || "-"}</td>
                      <td className="px-4 py-3 text-gray-700">{(zoneObj && zoneObj.name) || "-"}</td>
                      <td className="px-4 py-3 text-gray-700">{w.corporation_name || w.corporation || (corpId ? String(corpId) : "-")}</td>
                      <td className="px-4 py-3">
                        {w.status === 1 ? <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Active</span> : <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Inactive</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{w.created_at ? new Date(w.created_at).toLocaleString() : "-"}</td>
                      <td className="px-4 py-3">
                        <div className="inline-flex items-center gap-2">
                          {canEdit && (
                            <button onClick={() => openEdit(w)} title="Edit" className="px-2 py-1 border rounded text-sm bg-white hover:bg-gray-50">
                              <Icon name="edit" />
                            </button>
                          )}
                          {canStatus && (
                            <button onClick={() => setConfirmAction({ type: "status", ward: w, message: `${w.status === 1 ? "Deactivate" : "Activate"} ward "${w.name}"?`, confirmText: w.status === 1 ? "Deactivate" : "Activate", onConfirm: async () => { setConfirmAction(null); await doToggleStatus(w); } })} disabled={togglingId === w.id} className={`px-3 py-1 rounded text-xs font-medium ${w.status === 1 ? "bg-red-50 text-red-700 border" : "bg-emerald-50 text-emerald-700 border"}`}>
                              {togglingId === w.id ? <><Icon name="spinner" /> <span className="ml-2">...</span></> : (w.status === 1 ? "Deactivate" : "Activate")}
                            </button>
                          )}
                          {canDelete && (
                            <button onClick={() => setConfirmAction({ type: "delete", ward: w, message: `Delete ward "${w.name}"? This cannot be undone.`, confirmText: "Delete", onConfirm: async () => { setConfirmAction(null); await doDeleteWard(w); } })} className="px-2 py-1 border rounded text-sm bg-white hover:bg-gray-50 text-red-600">Delete</button>
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
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-16 auto overflow-auto">
          <div className="fixed inset-0 bg-black opacity-40" onClick={() => { setShowModal(false); setEditingId(null); }} />
          <form onSubmit={doSave} className="relative z-60 bg-white rounded-lg shadow-xl w-full max-w-3xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{editingId ? "Edit Ward" : "Add Ward"}</h3>
              <button type="button" onClick={() => { setShowModal(false); setEditingId(null); }} className="text-gray-500">✕</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <SearchableSelect name="ward_state" label="State" options={states} value={form.state_id} onChange={(v) => setFormField("state_id", v)} placeholder="Select state" />
              <SearchableSelect name="ward_city" label="City" options={cities} value={form.city_id} onChange={(v) => { const sel = cities.find((c) => String(c.id) === String(v)); if (sel) setSelectedCityName(sel.name); setFormField("city_id", v); }} placeholder="Select city" disabled={!form.state_id} displayValue={selectedCityName} />
              <SearchableSelect name="ward_corporation" label="Corporation" options={corporations} value={form.corporation_id} onChange={(v) => { const sel = corporations.find((c) => String(c.id) === String(v)); if (sel) setSelectedCorporationName(sel.name); setFormField("corporation_id", v); }} placeholder="Select corporation" disabled={!form.city_id} displayValue={selectedCorporationName} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <SearchableSelect name="ward_zone" label="Zone" options={zones} value={form.zone_id} onChange={(v) => { const sel = zones.find((z) => String(z.id) === String(v)); if (sel) setSelectedZoneName(sel.name); setFormField("zone_id", v); }} placeholder="Select zone" disabled={!form.corporation_id} displayValue={selectedZoneName} />
              <SearchableSelect name="ward_division" label="Division" options={divisions} value={form.division_id} onChange={(v) => { const sel = divisions.find((d) => String(d.id) === String(v)); if (sel) setSelectedDivisionName(sel.name); setFormField("division_id", v); }} placeholder="Select division" disabled={!form.zone_id} displayValue={selectedDivisionName} />
              <div>
                <label htmlFor="ward_name" className="block text-sm font-medium text-gray-700 mb-1">Ward Name</label>
                <input id="ward_name" name="ward_name" value={form.name} onChange={(e) => setFormField("name", e.target.value)} className="w-full border rounded px-3 py-2" required />
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <label className="flex items-center gap-2 text-sm">
                <input id="ward_status" name="ward_status" type="checkbox" checked={Number(form.status) === 1} onChange={(e) => setFormField("status", e.target.checked ? 1 : 0)} className="w-4 h-4" />
                <span className="text-sm text-gray-700">Active</span>
              </label>

              <div className="flex items-center gap-2">
                <button type="button" onClick={() => { setShowModal(false); setEditingId(null); }} className="px-4 py-2 bg-gray-100 rounded">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-emerald-600 text-white rounded">
                  {saving ? (<><Icon name="spinner" /> <span className="ml-2">Saving…</span></>) : (editingId ? "Update" : "Save")}
                </button>
              </div>
            </div>

            {/* Pincode manager */}
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-2">Ward pincodes</h4>
              <div className="border rounded p-3">
                <div className="flex gap-2 items-center">
                  <input id="new_pincode" name="new_pincode" value={newPincode} onChange={(e) => setNewPincode(e.target.value)} placeholder="Enter pincode" className="border rounded px-3 py-2" />
                  <button type="button" onClick={() => addPincode(editingId)} className="px-3 py-2 bg-emerald-600 text-white rounded">Add</button>
                </div>

                <div className="mt-3">
                  {pincodes.length === 0 ? (
                    <div className="text-sm text-gray-500">No pincodes assigned</div>
                  ) : (
                    <ul className="space-y-2">
                      {pincodes.map((p) => (
                        <li key={p.id} className="flex items-center justify-between border rounded p-2">
                          <div>{p.pincode}</div>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => deletePincode(p)} className="text-sm text-red-600">Remove</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

           {/* Confirm modal */}
      <ConfirmModal
        open={!!confirmAction}
        title={confirmAction?.title || "Confirm"}
        message={confirmAction?.message || ""}
        confirmText={confirmAction?.confirmText || "Yes"}
        cancelText="Cancel"
        onConfirm={
          confirmAction?.onConfirm ||
          (async () => {
            if (!confirmAction) return;
            const { type, ward } = confirmAction;
            setConfirmAction(null);
            if (type === "status") await doToggleStatus(ward);
            if (type === "delete") await doDeleteWard(ward);
          })
        }
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}

