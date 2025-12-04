import React, { useState, useEffect } from "react";
import RoomSection from "./RoomSection";
import TenantSection from "./TenantSection";
import PaymentSection from "./PaymentSection";
import BackupButton from "./BackupButton";

const BASE_URL = "http://127.0.0.1:5555";

const ManagerDashboard = () => {
  const [selectedSection, setSelectedSection] = useState("Rooms");
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  // 1. Fetch dashboard data with proper error handling
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const headers = { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        };

        const [roomsRes, tenantsRes, paymentsRes] = await Promise.all([
          fetch(`${BASE_URL}/rooms`, { headers }),
          fetch(`${BASE_URL}/tenants`, { headers }),
          fetch(`${BASE_URL}/payments`, { headers }),
        ]);

        // Handle rooms response
        if (roomsRes.ok) {
          const roomsData = await roomsRes.json();
          setRooms(Array.isArray(roomsData) ? roomsData : []);
        } else {
          const errorData = await roomsRes.json();
          console.error("Failed to fetch rooms:", errorData);
          setRooms([]);
        }

        // Handle tenants response
        if (tenantsRes.ok) {
          const tenantsData = await tenantsRes.json();
          setTenants(Array.isArray(tenantsData) ? tenantsData : []);
        } else {
          const errorData = await tenantsRes.json();
          console.error("Failed to fetch tenants:", errorData);
          setTenants([]);
        }

        // Handle payments response
        if (paymentsRes.ok) {
          const paymentsData = await paymentsRes.json();
          setPayments(Array.isArray(paymentsData) ? paymentsData : []);
        } else {
          const errorData = await paymentsRes.json();
          console.error("Failed to fetch payments:", errorData);
          setPayments([]);
        }

      } catch (err) {
        console.error("Error loading dashboard:", err);
        setError("Failed to load data. Please try again.");
        setRooms([]);
        setTenants([]);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    } else {
      setError("No authentication token found. Please login.");
      setLoading(false);
    }
  }, [token]);

  // 2. Add Room
  const handleAddRoom = async (newRoom) => {
    try {
      const res = await fetch(`${BASE_URL}/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newRoom),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add room");
      }

      const addedRoom = await res.json();
      setRooms((prev) => [...prev, addedRoom]);
      alert("Room added successfully!");
    } catch (error) {
      console.error("Error adding room:", error);
      alert(error.message || "Failed to add room. Please try again.");
    }
  };

  // 3. Add Tenant
  const handleAddTenant = async (newTenant) => {
    try {
      const res = await fetch(`${BASE_URL}/tenants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTenant),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add tenant");
      }

      const addedTenant = await res.json();
      setTenants((prev) => [...prev, addedTenant]);

      // If tenant was assigned to a room, update room status locally
      if (newTenant.room_id) {
        const roomId = parseInt(newTenant.room_id);
        setRooms((prev) =>
          prev.map((room) =>
            room.id === roomId
              ? { ...room, status: "occupied", tenant_id: addedTenant.id }
              : room
          )
        );
      }

      alert("Tenant added successfully!");
    } catch (error) {
      console.error("Error adding tenant:", error);
      alert(error.message || "Failed to add tenant. Please try again.");
    }
  };

  // 4. Add Payment
  const handleAddPayment = async (newPayment) => {
    try {
      const res = await fetch(`${BASE_URL}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPayment),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add payment");
      }

      const responseData = await res.json();
      const addedPayment = responseData.payment || responseData;
      const updatedRoom = responseData.room;

      setPayments((prev) => [...prev, addedPayment]);

      // Update room if returned
      if (updatedRoom && updatedRoom.id) {
        setRooms((prev) =>
          prev.map((room) => (room.id === updatedRoom.id ? updatedRoom : room))
        );
      }

      alert("Payment recorded successfully!");
    } catch (error) {
      console.error("Error adding payment:", error);
      alert(error.message || "Failed to record payment. Please try again.");
    }
  };

  // 5. Update Payment
  const handleUpdatePayment = async (id, updatedPayment) => {
    try {
      const response = await fetch(`${BASE_URL}/payments/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedPayment),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update payment");
      }

      const data = await response.json();

      setPayments((prev) => prev.map((p) => (p.id === id ? data : p)));
      alert("Payment updated successfully!");
    } catch (error) {
      console.error("Error updating payment:", error);
      alert(error.message || "Failed to update payment. Please try again.");
    }
  };

  // 6. Assign Tenant to Room
  const handleAssignTenant = async (roomId, tenantId) => {
    try {
      const response = await fetch(`${BASE_URL}/rooms/${roomId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tenant_id: tenantId,
          status: "occupied",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to assign tenant");
      }

      const updatedRoom = await response.json();

      setRooms((prevRooms) =>
        prevRooms.map((room) => (room.id === roomId ? updatedRoom : room))
      );

      alert("Tenant assigned successfully!");
    } catch (error) {
      console.error("Error assigning tenant:", error);
      alert(error.message || "Failed to assign tenant. Please try again.");
    }
  };

  // 7. Vacate Room
  const handleVacateRoom = async (roomId) => {
    try {
      const res = await fetch(`${BASE_URL}/rooms/${roomId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "vacant",
          tenant_id: null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to vacate room");
      }

      const updatedRoom = await res.json();

      setRooms((prev) => prev.map((room) => (room.id === roomId ? updatedRoom : room)));

      alert("Room vacated successfully!");
    } catch (error) {
      console.error("Error vacating room:", error);
      alert(error.message || "Failed to vacate room. Please try again.");
    }
  };

  // 8. Delete Room
  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm("Are you sure you want to delete this room?")) {
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/rooms/${roomId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete room");
      }

      setRooms((prev) => prev.filter((room) => room.id !== roomId));
      alert("Room deleted successfully!");
    } catch (error) {
      console.error("Error deleting room:", error);
      alert(error.message || "Failed to delete room. Please try again.");
    }
  };

  // 9. Render Sections
  const renderSection = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600 text-lg">Loading...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-red-600 text-lg">{error}</div>
        </div>
      );
    }

    switch (selectedSection) {
      case "Rooms":
        return (
          <RoomSection
            rooms={rooms}
            tenants={tenants}
            onAddRoom={handleAddRoom}
            onVacateRoom={handleVacateRoom}
            onDeleteRoom={handleDeleteRoom}
            onAssignTenant={handleAssignTenant}
          />
        );
      case "Tenants":
        return (
          <TenantSection
            tenants={tenants}
            rooms={rooms}
            onAddTenant={handleAddTenant}
          />
        );
      case "Payments":
        return (
          <PaymentSection
            payments={payments}
            tenants={tenants}
            rooms={rooms}
            onAddPayment={handleAddPayment}
            onUpdatePayment={handleUpdatePayment}
          />
        );
      default:
        return null;
    }
  };

  // 10. Dashboard Layout
  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-800 text-white flex flex-col justify-between shadow-xl">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-8 text-center tracking-wide">
            Serene Manager
          </h1>
          <ul className="space-y-2">
            {["Rooms", "Tenants", "Payments",].map((section) => (
              <li
                key={section}
                onClick={() => setSelectedSection(section)}
                className={`cursor-pointer px-4 py-2 rounded-lg transition duration-200 ${
                  selectedSection === section
                    ? "bg-blue-600 text-white shadow-md"
                    : "hover:bg-blue-700"
                }`}
              >
                {section}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-6 border-t border-blue-700">
          <BackupButton />
        </div>
      </aside>

      {/* Main Dashboard */}
      <main className="flex-1 p-8 overflow-y-auto">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">
          {selectedSection} Management
        </h2>
        <div className="bg-white p-8 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl">
          {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default ManagerDashboard;