import React from "react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <h1 className="text-3xl font-semibold text-red-600 mb-4">Unauthorized</h1>
        <p className="text-gray-600 mb-6">
          You do not have permission to access this page.
        </p>
        <a
          href="/dashboard"
          className="inline-flex items-center px-5 py-2.5 rounded-md text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
