import React, { useState } from "react";
import Modal from "./Modal";

const TenantSection = ({ tenants, rooms, onAddTenant }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTenant, setNewTenant] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleChange = (e) => {
    setNewTenant({ ...newTenant, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAddTenant(newTenant);
    setIsModalOpen(false);
    setNewTenant({
      name: "",
      email: "",
      phone: "",
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-700">Tenant List</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          + Add Tenant
        </button>
      </div>

      <table className="min-w-full border border-gray-200 rounded-lg shadow-sm">
        <thead className="bg-blue-50">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Phone</th>
            <th className="p-2 border">Room</th>
            <th className="p-2 border">Moving In</th>
          </tr>
        </thead>
        <tbody>
          {tenants.length > 0 ? (
            tenants.map((tenant) => (
              <tr key={tenant.id} className="hover:bg-gray-50">
                <td className="p-2 border">{tenant.name}</td>
                <td className="p-2 border">{tenant.email}</td>
                <td className="p-2 border">{tenant.phone || "N/A"}</td>
                <td className="p-2 border">
                  {rooms.find((r) => r.tenant_id === tenant.id)?.room_number || "Not Assigned"}
                </td>
                <td className="p-2 border">
                  {tenant.moving_in_date ? new Date(tenant.moving_in_date).toLocaleDateString() : "N/A"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center p-4 text-gray-500">
                No tenants available.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Add Tenant Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-2xl font-semibold mb-4 text-center text-blue-700">
          Add New Tenant
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter full name"
              value={newTenant.name}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              placeholder="example@email.com"
              value={newTenant.email}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="text"
              name="phone"
              placeholder="254712345678"
              value={newTenant.phone}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: 254XXXXXXXXX (for M-Pesa payments)
            </p>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-700">
              ℹ️ After creating the tenant, you can assign them to a room from the <strong>Rooms</strong> section using the "Assign" button.
            </p>
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded-lg transition font-medium"
          >
            Add Tenant
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default TenantSection;