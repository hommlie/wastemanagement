// src/pages/StatesPage.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { BASE_URL } from "../services/api";
import { toast } from "react-toastify";

export default function StatesPage() {
  const [states, setStates] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 0, from: 0, to: 0 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("name");
  const [dir, setDir] = useState("ASC");

  // ref for debounce timer (safe, hook used inside component)
  const searchTimerRef = useRef(null);

  // fetch function (stable with useCallback)
  const fetchStates = useCallback(async (opts = {}) => {
    const qPage = opts.page ?? page;
    const qLimit = opts.limit ?? limit;
    const qSearch = typeof opts.search !== "undefined" ? opts.search : search;
    const qSort = opts.sort ?? sort;
    const qDir = opts.dir ?? dir;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: qPage,
        limit: qLimit,
        search: qSearch || "",
        sort: qSort,
        dir: qDir
      });
      const res = await fetch(`${BASE_URL}/states?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      const json = await res.json();
      if (res.ok) {
        setStates(json.data || []);
        setMeta(json.meta || { total: 0, page: qPage, limit: qLimit, totalPages: 0, from: 0, to: 0 });
        setPage(qPage);
        setLimit(qLimit);
      } else {
        toast.error(json.message || "Failed to load states");
      }
    } catch (err) {
      toast.error(err.message || "Network error while fetching states");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sort, dir]);

  // initial load (page 1, limit 10)
  useEffect(() => {
    fetchStates({ page: 1, limit: 10 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // handle search input with debounce implemented via ref
  const onSearchChange = (e) => {
    const v = e.target.value;
    setSearch(v);

    // clear existing timer
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    // set new timer to call fetch after 500ms
    searchTimerRef.current = setTimeout(() => {
      fetchStates({ page: 1, limit, search: v });
      searchTimerRef.current = null;
    }, 500);
  };

  const onLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10) || 10;
    setLimit(newLimit);
    fetchStates({ page: 1, limit: newLimit, search });
  };

  const goToPage = (p) => {
    if (p < 1 || p > (meta.totalPages || 1)) return;
    fetchStates({ page: p, limit, search });
  };

  const next = () => goToPage(page + 1);
  const prev = () => goToPage(page - 1);

  // simple page numbers array (show up to 5 pages around current)
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

  return (
    <div className="p-6">
      {/* header */}
      <div className="flex flex-col sm:flex-row  sm:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">States</h1>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
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

          <div className="ml-auto w-full sm:w-72">
            <input
              value={search}
              onChange={onSearchChange}
              placeholder="Search by name or code..."
              className="block w-full pl-3 pr-3 py-2 border rounded-md text-sm"
            />
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="4" className="px-4 py-6 text-center text-sm text-gray-500">Loading…</td></tr>
              ) : states.length === 0 ? (
                <tr><td colSpan="4" className="px-4 py-6 text-center text-sm text-gray-500">No data available in table</td></tr>
              ) : (
                states.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">{meta.from + idx}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{s.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{s.code || "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{s.created_at ? new Date(s.created_at).toLocaleString() : "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* footer with show info and pagination */}
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
    </div>
  );
}
