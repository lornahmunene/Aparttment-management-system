import React, { useState } from "react";
import Modal from "./Modal";
import AssignTenantModal from "./AssignTenantModal";
import { useNavigate } from "react-router";
import {
  UserCircleIcon,
  UserPlusIcon,
  ArrowLeftOnRectangleIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";

const RoomSection = ({
  rooms,
  tenants,
  onAddRoom,
  onVacateRoom,
  onDeleteRoom,
  onAssignTenant,
}) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [showForm, setShowForm] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [roomForm, setRoomForm] = useState({
    room_number: "",
    status: "",
    rent_amount: "",
    room_type: "",
  });

  const handleChange = (e) => {
    setRoomForm({ ...roomForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddRoom(roomForm);
    setRoomForm({ room_number: "", status: "", rent_amount: "", room_type: "" });
    setShowForm(false);
  };

  const handleAssignClick = (roomId) => {
    setSelectedRoomId(roomId);
    setShowAssignModal(true);
  };

  const handleAssignTenant = (tenantId) => {
    if (tenantId && selectedRoomId) {
      onAssignTenant(selectedRoomId, tenantId);
      setShowAssignModal(false);
      setSelectedRoomId(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const availableTenants = tenants.filter(
    (tenant) => !rooms.some((room) => room.tenant_id === tenant.id)
  );

  const filteredRooms = rooms.filter((room) =>
    room.room_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">

      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Rooms</h2>

        {/* Search */}
        <div className="flex-1 mx-6 max-w-lg">
          <input
            type="text"
            placeholder="Search rooms..."
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Add Room + Profile */}
        <div className="flex items-center gap-4 relative">
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            +Add Room
          </button>

          {!token ? (
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            >
              Sign In
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="p-1 rounded-full hover:opacity-80 transition"
              >
                <UserCircleIcon className="h-10 w-10 text-gray-700" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg border z-50">
                  <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                    Profile
                  </button>
                  <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                    Settings
                  </button>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Room Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
        <h3 className="text-lg font-bold text-gray-700 mb-4">Add New Room</h3>
        <form onSubmit={handleSubmit} className="grid gap-4">

          <input
            type="text"
            name="room_number"
            placeholder="Room Number (e.g., 101)"
            value={roomForm.room_number}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
            required
          />

          <select
            name="status"
            value={roomForm.status}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
            required
          >
            <option value="">Select Status</option>
            <option value="vacant">Vacant</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
          </select>

          <input
            type="number"
            name="rent_amount"
            placeholder="Rent Amount (KSh)"
            value={roomForm.rent_amount}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
            required
          />

          <select
            name="room_type"
            value={roomForm.room_type}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
            required
          >
            <option value="">Select Type</option>
            <option value="single">Single</option>
            <option value="bedsitter">Bedsitter</option>
            <option value="1BHK">1 Bedroom</option>
            <option value="2BHK">2 Bedroom</option>
            <option value="3BHK">3 Bedroom</option>
          </select>

          <button
            type="submit"
            className="mt-2 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Save Room
          </button>
        </form>
      </Modal>

      {/* Room Table */}
      <div className="overflow-x-auto mt-6">
        <table className="min-w-full border border-gray-300 text-sm rounded-lg overflow-hidden shadow">
          <thead className="bg-gray-100">
            <tr>
              {["Room Number", "Status", "Rent", "Type", "Tenant", "Actions"].map(
                (header) => (
                  <th
                    key={header}
                    className="p-3 text-left font-semibold text-gray-700 border-b"
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {filteredRooms.map((room) => (
              <tr key={room.id} className="hover:bg-gray-50 transition">

                <td className="p-3 border-b font-medium">{room.room_number}</td>

                <td className="p-3 border-b">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      room.status === "occupied"
                        ? "bg-red-100 text-red-700"
                        : room.status === "vacant"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {room.status}
                  </span>
                </td>

                <td className="p-3 border-b">KSh {room.rent_amount}</td>
                <td className="p-3 border-b capitalize">{room.room_type}</td>

                <td className="p-3 border-b">
                  {room.tenant_id
                    ? tenants.find((t) => t.id === room.tenant_id)?.name ||
                      `ID: ${room.tenant_id}`
                    : "None"}
                </td>

                {/* ACTION BUTTONS */}
                <td className="p-3 border-b">
                  <div className="flex gap-2">

                    {/* Assign */}
                    {room.status !== "occupied" ? (
                      <button
                        onClick={() => handleAssignClick(room.id)}
                        disabled={availableTenants.length === 0}
                        className={`flex items-center gap-1 px-3 py-1 rounded-lg text-white text-sm font-medium transition
                          ${availableTenants.length === 0
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-600"}
                        `}
                      >
                        <UserPlusIcon className="h-4 w-4" />
                        Assign
                      </button>
                    ) : (
                      /* Vacate */
                      <button
                        onClick={() => onVacateRoom(room.id)}
                        className="flex items-center gap-1 px-3 py-1 bg-yellow-500 hover:bg-yellow-600
                        text-white rounded-lg text-sm font-medium transition"
                      >
                        <ArrowLeftOnRectangleIcon className="h-4 w-4" />
                        Vacate
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => onDeleteRoom(room.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700
                      text-white rounded-lg text-sm font-medium transition"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Delete
                    </button>

                  </div>
                </td>
              </tr>
            ))}

            {filteredRooms.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 py-6 font-medium">
                  No rooms found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Assign Tenant Modal */}
      <AssignTenantModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        tenants={availableTenants}
        onAssign={handleAssignTenant}
      />
    </div>
  );
};

export default RoomSection;