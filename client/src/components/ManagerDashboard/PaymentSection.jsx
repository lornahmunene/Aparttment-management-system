import React, { useState, useEffect } from "react";
import Modal from "./Modal";

const PaymentSection = ({ payments, tenants, rooms, onAddPayment }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showBalancesTable, setShowBalancesTable] = useState(false);
  const [tenantsWithBalances, setTenantsWithBalances] = useState([]);
  const [newPayment, setNewPayment] = useState({
    tenant_id: "",
    room_id: "",
    payment_price: "",
    payment_date: new Date().toISOString().split("T")[0],
  });

  // Calculate balances for all tenants
  useEffect(() => {
    calculateBalances();
  }, [payments, tenants, rooms]);

  const calculateBalances = () => {
    const today = new Date();
    
    const tenantsData = tenants.map((tenant) => {
      const assignedRoom = rooms.find((r) => r.tenant_id === tenant.id);
      
      if (!assignedRoom) {
        return { 
          ...tenant, 
          balance: 0, 
          totalPaid: 0, 
          expectedRent: 0,
          roomId: null,
          monthlyRent: 0
        };
      }

      const totalPaid = payments
        .filter((p) => p.tenant_id === tenant.id)
        .reduce((sum, p) => sum + parseFloat(p.payment_price || 0), 0);

      const movingInDate = new Date(tenant.moving_in_date);
      let monthsElapsed = (today.getFullYear() - movingInDate.getFullYear()) * 12 + 
                          (today.getMonth() - movingInDate.getMonth());
      
      if (today.getDate() >= movingInDate.getDate()) {
        monthsElapsed += 1;
      } else {
        monthsElapsed += 1;
      }

      monthsElapsed = Math.max(1, monthsElapsed);
      
      const monthlyRent = parseFloat(assignedRoom.rent_amount || 0);
      const expectedRent = monthsElapsed * monthlyRent;
      const balance = expectedRent - totalPaid;

      return {
        ...tenant,
        balance: balance,
        arrears: balance > 0 ? balance : 0,
        credit: balance < 0 ? Math.abs(balance) : 0,
        totalPaid,
        expectedRent,
        roomId: assignedRoom.room_id,
        monthlyRent: monthlyRent,
        monthsElapsed: monthsElapsed
      };
    });

    setTenantsWithBalances(tenantsData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewPayment({ ...newPayment, [name]: value });

    if (name === "tenant_id" && value) {
      const selectedTenant = tenantsWithBalances.find(
        (t) => t.id === parseInt(value)
      );
      if (selectedTenant) {
        const room = rooms.find((r) => r.tenant_id === selectedTenant.id);
        setNewPayment((prev) => ({
          ...prev,
          room_id: room?.id || "",
          payment_price: selectedTenant.monthlyRent || "",
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAddPayment(newPayment);
    setIsModalOpen(false);
    setNewPayment({
      tenant_id: "",
      room_id: "",
      payment_price: "",
      payment_date: new Date().toISOString().split("T")[0],
    });
  };

  const activeTenantsWithRooms = tenantsWithBalances.filter(
    (t) => rooms.some((r) => r.tenant_id === t.id)
  );

  const totalCollections = payments.reduce(
    (sum, p) => sum + parseFloat(p.payment_price || 0), 
    0
  );
  
  const totalArrears = tenantsWithBalances.reduce(
    (sum, t) => sum + (t.arrears || 0), 
    0
  );
  
  const totalCredit = tenantsWithBalances.reduce(
    (sum, t) => sum + (t.credit || 0), 
    0
  );

  const thisMonthCollections = payments
    .filter((p) => {
      const paymentDate = new Date(p.payment_date);
      const now = new Date();
      return (
        paymentDate.getMonth() === now.getMonth() &&
        paymentDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, p) => sum + parseFloat(p.payment_price || 0), 0);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-700">Payment Records</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBalancesTable(!showBalancesTable)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            {showBalancesTable ? "Hide" : "View"} Tenant Balances
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
          >
            + Record Payment
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600 mb-1">Total Collections</p>
          <p className="text-2xl font-bold text-blue-600">
            KSh {totalCollections.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-sm text-gray-600 mb-1">This Month</p>
          <p className="text-2xl font-bold text-purple-600">
            KSh {thisMonthCollections.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </p>
        </div>

        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-sm text-gray-600 mb-1">Total Arrears</p>
          <p className="text-2xl font-bold text-red-600">
            - KSh {totalArrears.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-gray-600 mb-1">Total Credit</p>
          <p className="text-2xl font-bold text-green-600">
            + KSh {totalCredit.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </p>
        </div>
      </div>

      {/* Tenant Balances Table (Toggle) */}
      {showBalancesTable && (
        <div className="mb-6 overflow-x-auto">
          <h4 className="text-lg font-semibold text-gray-700 mb-3">
            Current Tenant Balances
          </h4>
          <table className="min-w-full border border-gray-200 rounded-lg shadow-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border text-left">Tenant</th>
                <th className="p-3 border text-left">Room</th>
                <th className="p-3 border text-right">Monthly Rent</th>
                <th className="p-3 border text-center">Months</th>
                <th className="p-3 border text-right">Expected</th>
                <th className="p-3 border text-right">Total Paid</th>
                <th className="p-3 border text-right">Arrears</th>
                <th className="p-3 border text-right">Credit</th>
              </tr>
            </thead>
            <tbody>
              {activeTenantsWithRooms.length > 0 ? (
                activeTenantsWithRooms.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="p-3 border">{tenant.tenant_name}</td>
                    <td className="p-3 border">{tenant.roomId}</td>
                    <td className="p-3 border text-right">
                      {tenant.monthlyRent.toLocaleString()}
                    </td>
                    <td className="p-3 border text-center">
                      {tenant.monthsElapsed}
                    </td>
                    <td className="p-3 border text-right">
                      {tenant.expectedRent.toLocaleString()}
                    </td>
                    <td className="p-3 border text-right">
                      {tenant.totalPaid.toLocaleString()}
                    </td>
                    <td className="p-3 border text-right">
                      {tenant.arrears > 0 ? (
                        <span className="font-bold text-red-600">
                          - {tenant.arrears.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-3 border text-right">
                      {tenant.credit > 0 ? (
                        <span className="font-bold text-green-600">
                          + {tenant.credit.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center p-4 text-gray-500">
                    No active tenants with rooms.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment History Table */}
      <div className="overflow-x-auto">
        <h4 className="text-lg font-semibold text-gray-700 mb-3">
          Payment History
        </h4>
        <table className="min-w-full border border-gray-200 rounded-lg shadow-sm">
          <thead className="bg-blue-50">
            <tr>
              <th className="p-3 border text-left">Date</th>
              <th className="p-3 border text-left">Tenant</th>
              <th className="p-3 border text-left">Room</th>
              <th className="p-3 border text-right">Amount (KSh)</th>
            </tr>
          </thead>
          <tbody>
            {payments.length > 0 ? (
              payments
                .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))
                .map((payment) => {
                  const tenant = tenantsWithBalances.find(
                    (t) => t.id === payment.tenant_id
                  );
                  const room = rooms.find((r) => r.id === payment.room_id);

                  return (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="p-3 border">
                        {new Date(payment.payment_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="p-3 border">
                        {tenant?.tenant_name || "N/A"}
                      </td>
                      <td className="p-3 border">{room?.room_id || "N/A"}</td>
                      <td className="p-3 border text-right font-semibold text-blue-600">
                        {parseFloat(payment.payment_price).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </td>
                    </tr>
                  );
                })
            ) : (
              <tr>
                <td colSpan="4" className="text-center p-4 text-gray-500">
                  No payments recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Payment Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-2xl font-semibold mb-4 text-center text-blue-700">
          Record Payment
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tenant *
            </label>
            <select
              name="tenant_id"
              value={newPayment.tenant_id}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Tenant</option>
              {activeTenantsWithRooms.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.tenant_name} - Room {tenant.roomId}
                </option>
              ))}
            </select>
            
            {/* Compact balance info - only shows when tenant is selected */}
            {newPayment.tenant_id && (() => {
              const selectedTenant = tenantsWithBalances.find(
                (t) => t.id === parseInt(newPayment.tenant_id)
              );
              return selectedTenant ? (
                <div className="mt-2 text-sm bg-gray-50 p-2 rounded border border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rent:</span>
                    <span className="font-medium">KSh {selectedTenant.monthlyRent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expected:</span>
                    <span className="font-medium">KSh {selectedTenant.expectedRent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paid:</span>
                    <span className="font-medium">KSh {selectedTenant.totalPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-gray-300 mt-1">
                    <span className="text-gray-600 font-medium">Balance:</span>
                    <span className={`font-bold ${selectedTenant.arrears > 0 ? 'text-red-600' : selectedTenant.credit > 0 ? 'text-green-600' : 'text-gray-700'}`}>
                      {selectedTenant.arrears > 0 
                        ? `- KSh ${selectedTenant.arrears.toLocaleString()}`
                        : selectedTenant.credit > 0 
                        ? `+ KSh ${selectedTenant.credit.toLocaleString()}`
                        : 'KSh 0.00'}
                    </span>
                  </div>
                </div>
              ) : null;
            })()}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (KSh) *
            </label>
            <input
              type="number"
              name="payment_price"
              placeholder="Enter amount"
              value={newPayment.payment_price}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Date *
            </label>
            <input
              type="date"
              name="payment_date"
              value={newPayment.payment_date}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white w-full py-2 rounded-lg transition font-medium"
          >
            Record Payment
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default PaymentSection;