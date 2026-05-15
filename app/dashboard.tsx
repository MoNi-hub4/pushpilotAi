"use client";

import { useEffect, useState } from "react";

type PN = {
  _id: string;
  keyword: string;
  promo: string;
  category: string;
  tone?: string;
  brand?: string;
  header: string;
  body: string;
  reason?: string;
  createdAt: string;
};

export default function Dashboard() {
  const [form, setForm] = useState({
    keyword: "",
    promo: "",
    category: "",
    tone: "",
    brand: "",
  });

  const [results, setResults] = useState<PN[]>([]);
  const [savedResults, setSavedResults] = useState<PN[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(savedResults.length / itemsPerPage);

  const paginatedResults = savedResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    loadSavedPNs();
  }, []);

  async function loadSavedPNs() {
    const res = await fetch("/api/pns");
    const data = await res.json();

    if (data.success) {
      setSavedResults(data.data);
      setCurrentPage(1);
    }
  }

  async function generatePN() {
    setLoading(true);
    setError("");
    setResults([]);

    try {
      const res = await fetch("/api/generate-pn", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "failed to generate pn");
      }

      setResults(data.data);
      setSavedResults((prev) => [...data.data, ...prev]);
      setCurrentPage(1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "something went wrong");
    } finally {
      setLoading(false);
    }
  }
  const formFields = ["keyword", "promo", "category", "brand", "tone"] as const;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">PN Generator</h1>

      <div className="grid gap-4 mb-6">
        {formFields.map((field) => (
          <input
            key={field}
            placeholder={field}
            className="border p-3 rounded"
            value={form[field]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          />
        ))}

        <button
          onClick={generatePN}
          disabled={loading}
          className={`p-3 rounded text-white ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          {loading ? "generating..." : "generate 5 pns"}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 border rounded bg-red-50 text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-4 mb-10">
        {results.map((pn, index) => (
          <div key={pn._id} className="border rounded p-4 bg-white">
            <p className="font-bold mb-2">option {index + 1}</p>
            <p>
              <b>header:</b> {pn.header}
            </p>
            <p>
              <b>body:</b> {pn.body}
            </p>
            <p className="text-sm text-gray-500 mt-2">{pn.reason}</p>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mb-4">saved generated results</h2>

      <div className="overflow-x-auto border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">date</th>
              <th className="p-3 text-left">keyword</th>
              <th className="p-3 text-left">promo</th>
              <th className="p-3 text-left">category</th>
              <th className="p-3 text-left">header</th>
              <th className="p-3 text-left">body</th>
              <th className="p-3 text-left">brand</th>
              <th className="p-3 text-left">reason</th>
            </tr>
          </thead>

          <tbody>
            {savedResults.length === 0 ? (
              <tr>
                <td className="p-4 text-gray-500" colSpan={8}>
                  no saved results yet
                </td>
              </tr>
            ) : (
              paginatedResults.map((pn) => (
                <tr key={pn._id} className="border-t">
                  <td className="p-3">
                    {new Date(pn.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3">{pn.keyword}</td>
                  <td className="p-3">{pn.promo}</td>
                  <td className="p-3">{pn.category}</td>
                  <td className="p-3 font-medium">{pn.header}</td>
                  <td className="p-3">{pn.body}</td>
                  <td className="p-3">{pn.brand || "-"}</td>
                  <td className="p-3 text-gray-500 max-w-[180px] md:max-w-none">
                    <details className="md:hidden">
                      <summary className="cursor-pointer list-none">
                        <span className="inline-block max-w-[150px] truncate align-middle">
                          {pn.reason}
                        </span>
                        <span className="ml-1">⌄</span>
                      </summary>

                      <p className="mt-2 whitespace-normal break-words">
                        {pn.reason}
                      </p>
                    </details>

                    <span className="hidden md:block">{pn.reason}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 border rounded disabled:opacity-50 cursor-pointer "
        >
          previous
        </button>

        <div className="flex items-center gap-2">
          {(() => {
            const pages = [];

            if (totalPages <= 7) {
              for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
              }
            } else {
              if (currentPage <= 4) {
                pages.push(1, 2, 3, 4, 5, 6, "...", totalPages);
              } else if (currentPage >= totalPages - 3) {
                pages.push(
                  1,
                  "...",
                  totalPages - 5,
                  totalPages - 4,
                  totalPages - 3,
                  totalPages - 2,
                  totalPages - 1,
                  totalPages,
                );
              } else {
                pages.push(
                  1,
                  "...",
                  currentPage - 1,
                  currentPage,
                  currentPage + 1,
                  "...",
                  totalPages,
                );
              }
            }

            return pages.map((page, index) => {
              if (page === "...") {
                return (
                  <span key={`dots-${index}`} className="px-2 text-gray-500">
                    ...
                  </span>
                );
              }

              return (
                <button
                  key={page}
                  onClick={() => {
                    if (typeof page === "number") {
                      setCurrentPage(page);
                    }
                  }}
                  className={`px-3 py-1 rounded border ${
                    currentPage === page
                      ? "bg-purple-600 text-white"
                      : "bg-white text-black"
                  }`}
                >
                  {page}
                </button>
              );
            });
          })()}
        </div>

        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-4 py-2 border rounded disabled:opacity-50 cursor-pointer"
        >
          next
        </button>
      </div>
    </div>
  );
}
