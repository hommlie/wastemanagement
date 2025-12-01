// src/pages/CitiesPage.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { BASE_URL } from "../services/api";
import { toast } from "react-toastify";

export default function CitiesPage() {
  const [cities, setCities] = useState([]);
  const [states, setStates] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 0, from: 0, to: 0 });
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ state_id: "", name: "", city_code: "" });
  const [saving, setSaving] = useState(false);

  const searchTimerRef = useRef(null);

  const fetchStates = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/states`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const json = await res.json();
      if (res.ok) setStates(json.data || json || []);
      else toast.error(json.message || "Failed to load states");
    } catch (err) {
      toast.error(err.message || "Network error while loading states");
    }
  }, []);

  const fetchCities = useCallback(async (opts = {}) => {
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
      const res = await fetch(`${BASE_URL}/cities?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      const json = await res.json();
      if (res.ok) {
        setCities(json.data || []);
        setMeta(json.meta || { total: 0, page: qPage, limit: qLimit, totalPages: 0, from: 0, to: 0 });
        setPage(qPage);
        setLimit(qLimit);
      } else {
        toast.error(json.message || "Failed to load cities");
      }
    } catch (err) {
      toast.error(err.message || "Network error while fetching cities");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  // initial load
  useEffect(() => {
    fetchStates();
    fetchCities({ page: 1, limit: 10 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // search input with debounce
  const onSearchChange = (e) => {
    const v = e.target.value;
    setSearch(v);

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      fetchCities({ page: 1, limit, search: v });
      searchTimerRef.current = null;
    }, 500);
  };

  const onLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10) || 10;
    setLimit(newLimit);
    fetchCities({ page: 1, limit: newLimit, search });
  };

  const goToPage = (p) => {
    if (p < 1 || p > (meta.totalPages || 1)) return;
    fetchCities({ page: p, limit, search });
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

  function handleChange(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.state_id || !form.name.trim()) {
      toast.error("State and city name are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        state_id: parseInt(form.state_id, 10),
        name: form.name.trim(),
        city_code: (form.city_code || "").trim() || null
      };
      const res = await fetch(`${BASE_URL}/cities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (res.ok) {
        toast.success("City created");
        setForm({ state_id: "", name: "", city_code: "" });
        setShowAdd(false);
        // refresh current page (or go to first page)
        fetchCities({ page: 1, limit, search });
      } else if (res.status === 409) {
        toast.error(json.message || "City already exists");
      } else {
        toast.error(json.message || "Create failed");
      }
    } catch (err) {
      toast.error(err.message || "Network error while creating city");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
             <h1 className="text-2xl font-semibold text-gray-800">Cities</h1>
        </div>
        {/* <div>
              <button
                onClick={() => setShowAdd(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow-sm"
              >
                Add City
              </button>
        </div> */}
      </div>
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 mr-4">
            <label className="text-sm text-gray-600">Show</label>
            <select
              value={limit}
              onChange={onLimitChange}
              className="ml-1 block py-1 px-2 border rounded-md text-sm"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <label className="text-sm text-gray-600 ml-2">entries</label>
          </div>

          <div className="w-full sm:w-72 mr-4">
            <input
              value={search}
              onChange={onSearchChange}
              placeholder="Search city by name or code..."
              className="block w-full pl-3 pr-3 py-2 border rounded-md text-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="5" className="px-4 py-6 text-center text-sm text-gray-500">Loading…</td></tr>
              ) : cities.length === 0 ? (
                <tr><td colSpan="5" className="px-4 py-6 text-center text-sm text-gray-500">No data available in table</td></tr>
              ) : (
                cities.map((c, idx) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">{meta.from + idx}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{(c.state && c.state.name) || c.state_name || "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{c.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{c.city_code || "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.created_at ? new Date(c.created_at).toLocaleString() : "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* footer */}
        <div className="flex flex-col sm:flex-row items-end justify-between px-4 py-3 border-t">
          <div className="text-sm text-gray-600">
            Showing {meta.from} to {meta.to} of {meta.total} entries
          </div>

          <div className="mt-3 sm:mt-0">
            <nav className="inline-flex items-center space-x-1">
              <button
                onClick={() => goToPage(1)}
                disabled={page === 1}
                className="px-2 py-1 rounded border bg-white text-sm disabled:opacity-40"
              >
                «
              </button>
              <button
                onClick={prev}
                disabled={page === 1}
                className="px-2 py-1 rounded border bg-white text-sm disabled:opacity-40"
              >
                ‹
              </button>

              {getPageNumbers().map((p) => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`px-3 py-1 rounded border text-sm ${p === page ? "bg-emerald-600 text-white" : "bg-white"}`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={next}
                disabled={page === meta.totalPages || meta.totalPages === 0}
                className="px-2 py-1 rounded border bg-white text-sm disabled:opacity-40"
              >
                ›
              </button>
              <button
                onClick={() => goToPage(meta.totalPages || 1)}
                disabled={page === meta.totalPages || meta.totalPages === 0}
                className="px-2 py-1 rounded border bg-white text-sm disabled:opacity-40"
              >
                »
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Centered Modal for Add City */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <div className="fixed inset-0 bg-black opacity-40" onClick={() => setShowAdd(false)} />
          <form
            onSubmit={handleCreate}
            className="relative bg-white rounded-lg w-full max-w-lg mx-auto p-6 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Add City</h2>
              <button type="button" onClick={() => setShowAdd(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <select
                  name="state_id"
                  value={form.state_id}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">-- Select state --</option>
                  {states.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">City name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g. Pune"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">City code (optional)</label>
                <input
                  name="city_code"
                  value={form.city_code}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 bg-gray-200 rounded-md text-gray-700">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md">
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
