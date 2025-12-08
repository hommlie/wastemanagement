// adminFrontend/src/pages/CategoriesPage.jsx
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

export default function CategoriesPage() {
  if (!can("category", "view")) {
    return (
      <div className="p-10 text-center text-red-600 font-bold text-xl">
        Unauthorized
      </div>
    );
  }

  const [categories, setCategories] = useState([]);
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

  const [form, setForm] = useState({
    name: "",
    image: "",
    status: 1,
  });

  const [imageFile, setImageFile] = useState(null);

  const [variationRows, setVariationRows] = useState([
    {
      id: null,
      name: "",
      code: "",
      number_of_services: "",
      schedule_after_days: "",
      min_weight_kg: "",
      max_weight_kg: "",
      base_price: "",
      per_kg_price: "",
      status: 1,
      sort_order: 0,
    },
  ]);

  const [confirmAction, setConfirmAction] = useState(null);
  const searchTimerRef = useRef(null);

  const setFormField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const fetchCategories = useCallback(
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
        const res = await api.get(`/category?${params.toString()}`);
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
          setCategories(list);
          setMeta(metaData);
          setPage(metaData.page || qPage);
          setLimit(metaData.limit || qLimit);
        } else {
          if (res.status === 401 || json.message === "Unauthorized") return;
          toast.error(json.message || "Failed to load categories");
        }
      } catch (err) {
        toast.error(err.message || "Network error while fetching categories");
      } finally {
        setLoading(false);
      }
    },
    [page, limit, search]
  );

  useEffect(() => {
    fetchCategories({ page: 1, limit: 10 });
  }, [fetchCategories]);

  function onSearchChange(e) {
    const v = e.target.value;
    setSearch(v);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      fetchCategories({ page: 1, limit, search: v });
      searchTimerRef.current = null;
    }, 400);
  }

  const onLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10) || 10;
    setLimit(newLimit);
    fetchCategories({ page: 1, limit: newLimit, search });
  };

  const goToPage = (p) => {
    const totalPages =
      meta.totalPages || (meta.total ? Math.ceil(meta.total / limit) : 1);
    if (p < 1 || p > totalPages) return;
    fetchCategories({ page: p, limit, search });
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
    setForm({ name: "", image: "", status: 1 });
    setImageFile(null);
    setVariationRows([
      {
        id: null,
        name: "",
        code: "",
        number_of_services: "",
        schedule_after_days: "",
        min_weight_kg: "",
        max_weight_kg: "",
        base_price: "",
        per_kg_price: "",
        status: 1,
        sort_order: 0,
      },
    ]);
  }

  function openAdd() {
    if (!can("category", "create")) {
      toast.error("You do not have permission to create categories");
      return;
    }
    setEditingId(null);
    resetForm();
    setShowModal(true);
  }

  function openEdit(category) {
    if (!can("category", "edit")) {
      toast.error("You do not have permission to edit categories");
      return;
    }
    setEditingId(category.id);
    setForm({
      name: category.name || "",
      image: category.image || "",
      status: typeof category.status !== "undefined" ? category.status : 1,
    });
    setImageFile(null);

    const rows =
      Array.isArray(category.variations) && category.variations.length
        ? category.variations
            .slice()
            .sort(
              (a, b) =>
                (a.sort_order || 0) - (b.sort_order || 0) ||
                a.id - b.id
            )
            .map((v, idx) => ({
              id: v.id,
              name: v.name || "",
              code: v.code || "",
              number_of_services: v.number_of_services || "",
              schedule_after_days: v.schedule_after_days || "",
              min_weight_kg: v.min_weight_kg || "",
              max_weight_kg: v.max_weight_kg || "",
              base_price: v.base_price || "",
              per_kg_price: v.per_kg_price || "",
              status: typeof v.status !== "undefined" ? v.status : 1,
              sort_order:
                typeof v.sort_order !== "undefined" ? v.sort_order : idx,
            }))
        : [
            {
              id: null,
              name: "",
              code: "",
              number_of_services: "",
              schedule_after_days: "",
              min_weight_kg: "",
              max_weight_kg: "",
              base_price: "",
              per_kg_price: "",
              status: 1,
              sort_order: 0,
            },
          ];

    setVariationRows(rows);
    setShowModal(true);
  }

  function addVariationRow() {
    setVariationRows((rows) => [
      ...rows,
      {
        id: null,
        name: "",
        code: "",
        number_of_services: "",
        schedule_after_days: "",
        min_weight_kg: "",
        max_weight_kg: "",
        base_price: "",
        per_kg_price: "",
        status: 1,
        sort_order: rows.length,
      },
    ]);
  }

  function updateVariationRow(index, key, value) {
    setVariationRows((rows) =>
      rows.map((r, i) =>
        i === index
          ? {
              ...r,
              [key]: value,
            }
          : r
      )
    );
  }

  function removeVariationRow(index) {
    setVariationRows((rows) => rows.filter((_, i) => i !== index));
  }

  async function handleSave(e) {
  e.preventDefault();

  if (!form.name.trim()) {
    toast.error("Category name is required");
    return;
  }

  const cleanedVariations = variationRows
    .map((v, idx) => ({
      ...v,
      name: (v.name || "").trim(),
      sort_order:
        typeof v.sort_order !== "undefined" ? v.sort_order : idx,
    }))
    .filter((v) => v.name);

  if (cleanedVariations.length === 0) {
    toast.error("At least one variation is required");
    return;
  }

  setSaving(true);
  try {
    const fd = new FormData();
    fd.append("name", form.name.trim());
    fd.append("status", String(form.status));
    if (imageFile) {
      fd.append("image", imageFile);
    }
    fd.append("variations", JSON.stringify(cleanedVariations));

    const path = editingId
      ? `/category_with_variations/${editingId}`
      : `/category_with_variations`;

    const res = editingId
      ? await api.put(path, fd)
      : await api.post(path, fd);

    // ----- yahan se JSON parse safe tarike se -----
    const contentType = res.headers.get("content-type") || "";
    let json = null;

    if (contentType.includes("application/json")) {
      json = await res.json();
    } else {
      // server ne HTML / kuch aur bheja
      const text = await res.text();
      console.error("Non-JSON response:", text);
      toast.error("Unexpected server response");
      return;
    }
    // ----- yahan tak -----

    const appError =
      typeof json.status !== "undefined" &&
      (json.status === 0 || json.status === "0");

    if (!res.ok || appError) {
      if (res.status === 401 || json.message === "Unauthorized") return;
      toast.error(json.message || "Save failed");
      return;
    }

    toast.success(
      editingId
        ? "Category and variations updated"
        : "Category and variations created"
    );
    setShowModal(false);
    setEditingId(null);
    resetForm();
    fetchCategories({ page: 1, limit, search: "" });
  } catch (err) {
    console.error(err);
    toast.error(err.message || "Network error while saving");
  } finally {
    setSaving(false);
  }
}


  async function doDelete(category) {
    if (!can("category", "delete")) {
      toast.error("You do not have permission to delete categories");
      return;
    }
    try {
      const res = await api.delete(`/category/${category.id}`);
      const json = await res.json();
      if (!res.ok || json.status === 0) {
        toast.error(json.message || "Delete failed");
        return;
      }
      toast.success("Category deleted");
      fetchCategories({ page: 1, limit, search: "" });
    } catch (err) {
      toast.error(err.message || "Network error while deleting");
    }
  }

  return (
    <div className="p-6 mx-auto ">
      {/* header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create categories and add multiple variations in one go.
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
              placeholder="Search categories..."
              className="border rounded px-3 py-2 w-64"
            />
          </div>

          {can("category", "create") && (
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded shadow"
            >
              <Icon name="plus" /> Add Category
            </button>
          )}
        </div>
      </div>

      {/* table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  Image
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                  Variations
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
                    colSpan="7"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    <Icon name="spinner" />{" "}
                    <span className="ml-2">Loading…</span>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No categories available
                  </td>
                </tr>
              ) : (
                categories.map((c, idx) => (
                  <tr key={c.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {(meta.from || 0) + idx}
                    </td>
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3">
                      {c.image ? (
                        <img
                          src={c.image}
                          alt={c.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {c.status === 1 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {Array.isArray(c.variations) && c.variations.length > 0
                        ? c.variations
                            .map((v) => v.name)
                            .slice(0, 3)
                            .join(", ") + (c.variations.length > 3 ? "…" : "")
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {c.created_at
                        ? new Date(c.created_at).toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="inline-flex gap-2">
                        {can("category", "edit") && (
                          <button
                            onClick={() => openEdit(c)}
                            title="Edit"
                            className="px-2 py-1 border rounded text-sm bg-white hover:bg-gray-50"
                          >
                            <Icon name="pencil" />
                          </button>
                        )}
                        {can("category", "delete") && (
                          <button
                            onClick={() =>
                              setConfirmAction({ type: "delete", category: c })
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
            {meta.total ? (
              <>
                Showing {meta.from || 0} to {meta.to || 0} of {meta.total || 0}
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

      {/* Modal */}
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
            className="relative z-60 bg-white rounded-lg shadow-xl w-full max-w-3xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingId
                  ? "Edit Category & Variations"
                  : "Add Category & Variations"}
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

            <div className="border-b pb-4 mb-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">
                Category Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setFormField("name", e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    placeholder="e.g. Household Waste"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image (upload)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files && e.target.files[0];
                      setImageFile(file || null);
                    }}
                    className="w-full border rounded px-3 py-2"
                  />
                  {form.image && !imageFile && (
                    <div className="mt-2">
                      <span className="block text-xs text-gray-500 mb-1">
                        Current Image:
                      </span>
                      <img
                        src={form.image}
                        alt="Category"
                        className="w-16 h-16 object-cover rounded border"
                      />
                    </div>
                  )}
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
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-800">
                  Variations
                </h4>
                <button
                  type="button"
                  onClick={addVariationRow}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded border text-xs bg-white hover:bg-gray-50"
                >
                  <Icon name="plus" /> Add Variation
                </button>
              </div>

              <div className="space-y-3 max-h-80 overflow-auto border rounded p-3 bg-gray-50">
                {variationRows.map((v, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 md:grid-cols-6 gap-2 bg-white rounded border p-2"
                  >
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        value={v.name}
                        onChange={(e) =>
                          updateVariationRow(idx, "name", e.target.value)
                        }
                        className="w-full border rounded px-2 py-1 text-sm"
                        placeholder="0–10 KG, Monthly Plan..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Code
                      </label>
                      <input
                        value={v.code}
                        onChange={(e) =>
                          updateVariationRow(idx, "code", e.target.value)
                        }
                        className="w-full border rounded px-2 py-1 text-sm"
                        placeholder="optional"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        No. of Services
                      </label>
                      <input
                        type="number"
                        value={v.number_of_services}
                        onChange={(e) =>
                          updateVariationRow(
                            idx,
                            "number_of_services",
                            e.target.value
                          )
                        }
                        className="w-full border rounded px-2 py-1 text-sm"
                        placeholder="e.g. 4"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Schedule (days)
                      </label>
                      <input
                        type="number"
                        value={v.schedule_after_days}
                        onChange={(e) =>
                          updateVariationRow(
                            idx,
                            "schedule_after_days",
                            e.target.value
                          )
                        }
                        className="w-full border rounded px-2 py-1 text-sm"
                        placeholder="e.g. 7"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Min Weight (kg)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={v.min_weight_kg}
                        onChange={(e) =>
                          updateVariationRow(
                            idx,
                            "min_weight_kg",
                            e.target.value
                          )
                        }
                        className="w-full border rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Max Weight (kg)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={v.max_weight_kg}
                        onChange={(e) =>
                          updateVariationRow(
                            idx,
                            "max_weight_kg",
                            e.target.value
                          )
                        }
                        className="w-full border rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Base Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={v.base_price}
                        onChange={(e) =>
                          updateVariationRow(
                            idx,
                            "base_price",
                            e.target.value
                          )
                        }
                        className="w-full border rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Per KG Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={v.per_kg_price}
                        onChange={(e) =>
                          updateVariationRow(
                            idx,
                            "per_kg_price",
                            e.target.value
                          )
                        }
                        className="w-full border rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={v.status}
                        onChange={(e) =>
                          updateVariationRow(
                            idx,
                            "status",
                            parseInt(e.target.value, 10)
                          )
                        }
                        className="w-full border rounded px-2 py-1 text-sm"
                      >
                        <option value={1}>Active</option>
                        <option value={0}>Inactive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Sort Order
                      </label>
                      <input
                        type="number"
                        value={v.sort_order}
                        onChange={(e) =>
                          updateVariationRow(
                            idx,
                            "sort_order",
                            parseInt(e.target.value || 0, 10)
                          )
                        }
                        className="w-full border rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div className="flex items-end justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => removeVariationRow(idx)}
                        className="px-2 py-2 border rounded text-xs text-red-600 bg-white hover:bg-gray-50 w-full"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
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

      <ConfirmModal
        open={!!confirmAction}
        title={
          confirmAction?.type === "delete"
            ? "Delete category?"
            : "Confirm"
        }
        message={
          confirmAction?.type === "delete"
            ? `Delete category "${confirmAction.category.name}"? This cannot be undone.`
            : "Are you sure?"
        }
        confirmText={
          confirmAction?.type === "delete" ? "Delete" : "Yes"
        }
        cancelText="Cancel"
        onConfirm={async () => {
          if (!confirmAction) return;
          const { type, category } = confirmAction;
          setConfirmAction(null);
          if (type === "delete") await doDelete(category);
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
