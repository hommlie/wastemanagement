// src/pages/ZonesPage.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { BASE_URL } from "../services/api";
import { toast } from "react-toastify";
export default function ZonesPage() {
  const [zones, setZones] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 0, from: 0, to: 0 });
  const [loading, setLoading] = useState(false);

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [availablePincodes, setAvailablePincodes] = useState([]); // pincodes for selected city

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Add modal state
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    state_id: "",
    city_id: "",
    name: "",
    code: "",
    pincodes_text: "", 
    selected_pincode_ids: [] 
  });

  const searchTimerRef = useRef(null);

  // load states once
  const fetchStates = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/states`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      const json = await res.json();
      if (res.ok) setStates(json.data || []);
      else toast.error(json.message || "Failed to load states");
    } catch (err) {
      toast.error(err.message || "Network error loading states");
    }
  }, []);

  // load cities for a state
  const fetchCities = useCallback(async (stateId) => {
    if (!stateId) {
      setCities([]);
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/cities/state/${stateId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      const json = await res.json();
      if (res.ok) setCities(json.data || []);
      else {
        setCities([]);
        toast.error(json.message || "Failed to load cities");
      }
    } catch (err) {
      setCities([]);
      toast.error(err.message || "Network error loading cities");
    }
  }, []);

  // load available pincodes for a city (to allow checkbox selection)
  const fetchPincodesForCity = useCallback(async (cityId) => {
    if (!cityId) {
      setAvailablePincodes([]);
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/cities/${cityId}/pincodes`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      const json = await res.json();
      if (res.ok) setAvailablePincodes(json.data || []);
      else setAvailablePincodes([]);
    } catch (err) {
      setAvailablePincodes([]);
    }
  }, []);

  // fetch zones (with server-side pagination & search)
  const fetchZones = useCallback(async (opts = {}) => {
    const qPage = opts.page ?? page;
    const qLimit = opts.limit ?? limit;
    const qSearch = typeof opts.search !== "undefined" ? opts.search : search;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: qPage,
        limit: qLimit,
        search: qSearch || ""
      });
      const res = await fetch(`${BASE_URL}/zones?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      const json = await res.json();
      if (res.ok) {
        setZones(json.data || []);
        setMeta(json.meta || { total: 0, page: qPage, limit: qLimit, totalPages: 0, from: 0, to: 0 });
        setPage(qPage);
        setLimit(qLimit);
      } else {
        toast.error(json.message || "Failed to load zones");
      }
    } catch (err) {
      toast.error(err.message || "Network error while fetching zones");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    fetchStates();
    fetchZones({ page: 1, limit: 10 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // debounced search
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

  const next = () => goToPage(page + 1);
  const prev = () => goToPage(page - 1);

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

  // Form handlers
  function setFormField(k, v) {
    setForm(p => ({ ...p, [k]: v }));
  }

  // when state selected, load its cities
  useEffect(() => {
    if (form.state_id) fetchCities(form.state_id);
    else setCities([]);
    // clear city & pincodes choices on state change
    setForm(p => ({ ...p, city_id: "", selected_pincode_ids: [], pincodes_text: "" }));
    setAvailablePincodes([]);
  }, [form.state_id, fetchCities]);

  // when city selected, load pincodes for that city
  useEffect(() => {
    if (form.city_id) fetchPincodesForCity(form.city_id);
    else setAvailablePincodes([]);
    setForm(p => ({ ...p, selected_pincode_ids: [], pincodes_text: "" }));
  }, [form.city_id, fetchPincodesForCity]);

  // toggle selected pincode id
  function toggleSelectPincode(id) {
    setForm(p => {
      const arr = new Set(p.selected_pincode_ids || []);
      if (arr.has(id)) arr.delete(id); else arr.add(id);
      return { ...p, selected_pincode_ids: Array.from(arr) };
    });
  }

  // build payload and submit
  async function handleCreate(e) {
    e.preventDefault();
    if (!form.city_id || !form.name.trim()) {
      toast.error("City and Zone name required");
      return;
    }
    // build `pincodes` payload: if user selected existing ones use their codes,
    // else if pasted text exists use that. If both present, combine (unique).
    let combined = [];
    try {
      if (form.selected_pincode_ids && form.selected_pincode_ids.length > 0 && availablePincodes.length > 0) {
        const selectedCodes = availablePincodes
          .filter(p => form.selected_pincode_ids.includes(p.id))
          .map(p => p.pincode);
        combined = combined.concat(selectedCodes);
      }
      if (form.pincodes_text && form.pincodes_text.trim()) {
        // split by comma/newline/space
        const fromText = String(form.pincodes_text).split(/[\s,;|]+/).map(s => s.trim()).filter(Boolean);
        combined = combined.concat(fromText);
      }
      // normalize client-side: digits only, 6-digit
      combined = Array.from(new Set(combined.map(s => String(s).trim()).filter(s => /^\d{6}$/.test(s))));
      if (combined.length === 0) {
        toast.error("At least one valid pincode (6 digits) is required");
        return;
      }
    } catch (err) {
      toast.error("Invalid pincodes input");
      return;
    }

    setAdding(true);
    try {
      const payload = {
        city_id: parseInt(form.city_id, 10),
        name: form.name.trim(),
        code: form.code ? form.code.trim() : undefined,
        pincodes: combined // backend accepts array or string
      };
      const res = await fetch(`${BASE_URL}/zones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (res.ok) {
        toast.success("Zone created");
        setShowAdd(false);
        // reset form
        setForm({ state_id: form.state_id, city_id: "", name: "", code: "", pincodes_text: "", selected_pincode_ids: [] });
        // refresh list (go to first page)
        fetchZones({ page: 1, limit, search: "" });
      } else if (res.status === 409) {
        // conflicts -- show details
        const conflicts = json.conflicts || json.conflict || [];
        let msg = json.message || "Some pincodes already assigned";
        if (Array.isArray(conflicts) && conflicts.length > 0) {
          const list = conflicts.map(c => `${c.pincode}${c.zone_name ? ` (in ${c.zone_name})` : ""}`).join(", ");
          msg += ": " + list;
        }
        toast.error(msg);
      } else {
        toast.error(json.message || "Create failed");
      }
    } catch (err) {
      toast.error(err.message || "Network error while creating zone");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="p-6">
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Zones</h1>
          <p className="text-sm text-gray-500 mt-1">Manage zones and assign pincodes (city-wise).</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 mr-4">
            <label className="text-sm text-gray-600">Show</label>
            <select value={limit} onChange={onLimitChange} className="ml-1 block py-1 px-2 border rounded-md text-sm">
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <label className="text-sm text-gray-600 ml-2">entries</label>
          </div>

          <div className="w-full sm:w-72 mr-4">
            <input value={search} onChange={onSearchChange} placeholder="Search zone by name or code..." className="block w-full pl-3 pr-3 py-2 border rounded-md text-sm" />
          </div>

          <div>
            <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow-sm">Add Zone</button>
          </div>
        </div>
      </div>

      {/* table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zone Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pincodes</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="6" className="px-4 py-6 text-center text-sm text-gray-500">Loading…</td></tr>
              ) : zones.length === 0 ? (
                <tr><td colSpan="6" className="px-4 py-6 text-center text-sm text-gray-500">No zones found</td></tr>
              ) : (
                zones.map((z, idx) => (
                  <tr key={z.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">{meta.from + idx}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{z.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{(z.city && z.city.name) || "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{z.code || "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {/* show pincodes comma separated */}
                      {Array.isArray(z.pincodes) && z.pincodes.length > 0
                        ? z.pincodes.map(p => p.pincode || p).slice(0, 6).join(", ") + (z.pincodes.length > 6 ? "…" : "")
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{z.created_at ? new Date(z.created_at).toLocaleString() : "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t gap-3">
          <div className="text-sm text-gray-600">Showing {meta.from} to {meta.to} of {meta.total} entries</div>

          <div className="flex items-center gap-3 ml-auto">
            <nav className="inline-flex items-center space-x-1">
              <button onClick={() => goToPage(1)} disabled={page === 1} className="px-2 py-1 rounded border bg-white text-sm disabled:opacity-40">«</button>
              <button onClick={prev} disabled={page === 1} className="px-2 py-1 rounded border bg-white text-sm disabled:opacity-40">‹</button>

              {getPageNumbers().map(p => (
                <button key={p} onClick={() => goToPage(p)} className={`px-3 py-1 rounded border text-sm ${p === page ? "bg-emerald-600 text-white" : "bg-white"}`}>{p}</button>
              ))}

              <button onClick={next} disabled={page === meta.totalPages || meta.totalPages === 0} className="px-2 py-1 rounded border bg-white text-sm disabled:opacity-40">›</button>
              <button onClick={() => goToPage(meta.totalPages || 1)} disabled={page === meta.totalPages || meta.totalPages === 0} className="px-2 py-1 rounded border bg-white text-sm disabled:opacity-40">»</button>
            </nav>
          </div>
        </div>
      </div>

      {/* Modal: Add Zone (centered) */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <div className="fixed inset-0 bg-black opacity-40" onClick={() => setShowAdd(false)} />

          <form onSubmit={handleCreate} className="relative bg-white rounded-lg w-full max-w-2xl mx-auto p-6 z-10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Add Zone</h2>
              <button type="button" onClick={() => setShowAdd(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <select value={form.state_id} onChange={(e) => setFormField("state_id", e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-2 px-3">
                  <option value="">-- Select state --</option>
                  {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <select value={form.city_id} onChange={(e) => setFormField("city_id", e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-2 px-3">
                  <option value="">-- Select city --</option>
                  {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Zone Code (optional)</label>
                <input value={form.code} onChange={(e) => setFormField("code", e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-2 px-3" placeholder="e.g. Z-W-1" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Zone Name</label>
                <input value={form.name} onChange={(e) => setFormField("name", e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-2 px-3" placeholder="e.g. West Zone" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Pincodes (paste)</label>
                <input value={form.pincodes_text} onChange={(e) => setFormField("pincodes_text", e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-2 px-3" placeholder="110001,110002 or newline separated" />
                <div className="text-xs text-gray-400 mt-1">You can paste comma or newline separated pincodes. Only 6-digit pincodes processed.</div>
              </div>
            </div>

            {/* optional: show existing pincodes to select from */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Or select existing pincodes (for selected city)</label>
                  <div className="text-xs text-gray-400">Click to choose — selected pincodes will be combined with pasted list.</div>
                </div>
                <div>
                  <button type="button" onClick={() => { setFormField("selected_pincode_ids", []); setFormField("pincodes_text", ""); }} className="text-xs text-gray-500 hover:underline">Clear</button>
                </div>
              </div>

              <div className="max-h-44 overflow-auto border rounded p-2 bg-gray-50">
                {availablePincodes.length === 0 ? (
                  <div className="text-sm text-gray-500">No pincodes loaded for this city.</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {availablePincodes.map(p => {
                      const checked = form.selected_pincode_ids.includes(p.id);
                      return (
                        <label key={p.id} className={`flex items-center gap-2 text-sm p-1 rounded ${checked ? "bg-emerald-100" : "hover:bg-white"}`}>
                          <input type="checkbox" checked={checked} onChange={() => toggleSelectPincode(p.id)} className="w-4 h-4" />
                          <span>{p.pincode}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 bg-gray-200 rounded-md text-gray-700">Cancel</button>
              <button type="submit" disabled={adding} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md">
                {adding ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
