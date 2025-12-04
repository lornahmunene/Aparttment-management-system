import React, { useState } from "react";

const AssignTenantModal = ({ isOpen, onClose, tenants, onAssign }) => {
  const [selectedTenant, setSelectedTenant] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
        <h3 className="text-xl font-semibold text-center text-gray-800 mb-4">
          Assign Tenant
        </h3>
        <select
          value={selectedTenant}
          onChange={(e) => setSelectedTenant(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 mb-4 focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select Tenant --</option>
          {tenants.map((t) => (
            <option key={t.id} value={t.id}>
              {t.tenant_name}
            </option>
          ))}
        </select>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={() => onAssign(selectedTenant)}
            disabled={!selectedTenant}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300"
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignTenantModal;
