// src/pages/inventory/ViewWarehouse.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Warehouse, Building, MapPin, User, Phone, Mail, Package, TrendingUp, CheckCircle, XCircle, Loader, AlertCircle, FileText } from 'lucide-react';
import BASE_URL from '../../config/Config';

const ViewWarehouse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [warehouse, setWarehouse] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem('token');

  const fetchWarehouseDetails = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}/warehouse/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setWarehouse(data.data.warehouse);
        setInventory(data.data.inventory || []);
      } else {
        setError(data.message || 'Failed to fetch warehouse details');
      }
    } catch (error) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWarehouseDetails(); }, [id]);

  const formatNumber = (num) => new Intl.NumberFormat('en-IN').format(num || 0);
  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);

  if (loading) return <div className="flex justify-center py-12"><Loader className="w-8 h-8 animate-spin text-green-700" /></div>;
  if (error) return <div className="bg-red-50 p-6 text-center rounded-xl"><AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" /><p className="text-red-600">{error}</p></div>;

  const capacityPercent = warehouse?.capacity?.total ? ((warehouse.capacity.used || 0) / warehouse.capacity.total) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3"><button onClick={() => navigate('/warehouses')} className="p-2 rounded-lg hover:bg-gray-100"><ArrowLeft className="w-5 h-5 text-green-700" /></button><div><h1 className="text-2xl font-bold text-green-900">{warehouse?.name}</h1><p className="text-sm text-gray-500">Code: {warehouse?.code}</p></div></div>
        <button onClick={() => navigate(`/warehouses/edit/${id}`)} className="px-4 py-2 rounded-lg bg-green-700 text-white flex items-center gap-2"><Edit2 className="w-4 h-4" /> Edit Warehouse</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-green-50"><h2 className="font-semibold text-green-800">Warehouse Information</h2></div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div><p className="text-xs text-gray-500">Warehouse Name</p><p className="font-semibold text-green-800">{warehouse?.name}</p></div>
              <div><p className="text-xs text-gray-500">Warehouse Code</p><p className="font-mono font-semibold">{warehouse?.code}</p></div>
              <div><p className="text-xs text-gray-500">Status</p><span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${warehouse?.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{warehouse?.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}{warehouse?.isActive ? 'Active' : 'Inactive'}</span></div>
              <div><p className="text-xs text-gray-500">Created By</p><p className="text-sm">{warehouse?.createdBy?.name}</p></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-green-50"><div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-green-700" /><h2 className="font-semibold text-green-800">Location</h2></div></div>
            <div className="p-6"><p className="text-gray-700">{warehouse?.location?.address}</p><p className="mt-1">{warehouse?.location?.city}, {warehouse?.location?.state} - {warehouse?.location?.pincode}</p></div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-green-50"><div className="flex items-center gap-2"><User className="w-4 h-4 text-green-700" /><h2 className="font-semibold text-green-800">Manager Details</h2></div></div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div><p className="text-xs text-gray-500">Manager Name</p><p className="font-semibold">{warehouse?.manager?.name}</p></div>
              <div><p className="text-xs text-gray-500">Phone</p><p className="flex items-center gap-1"><Phone className="w-3 h-3 text-gray-400" />{warehouse?.manager?.phone}</p></div>
              <div className="col-span-2"><p className="text-xs text-gray-500">Email</p><p className="flex items-center gap-1"><Mail className="w-3 h-3 text-gray-400" />{warehouse?.manager?.email || 'Not provided'}</p></div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <h3 className="text-lg font-bold mb-3 text-green-800">Capacity Usage</h3>
            <div className="mb-2 flex justify-between text-sm"><span>Used: {formatNumber(warehouse?.capacity?.used)} {warehouse?.capacity?.unit}</span><span>Total: {formatNumber(warehouse?.capacity?.total)} {warehouse?.capacity?.unit}</span></div>
            <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${Math.min(capacityPercent, 100)}%` }}></div></div>
            <p className="text-xs text-gray-500 mt-2">{capacityPercent.toFixed(1)}% capacity utilized</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-green-50"><div className="flex items-center gap-2"><Package className="w-4 h-4 text-green-700" /><h2 className="font-semibold text-green-800">Inventory Summary</h2></div></div>
            <div className="p-6"><div className="text-center"><p className="text-3xl font-bold text-green-800">{warehouse?.stats?.productCount || 0}</p><p className="text-sm text-gray-500">Products Stored</p></div><div className="mt-4 pt-4 border-t text-center"><p className="text-2xl font-bold text-orange-600">{formatNumber(warehouse?.stats?.totalStockUnits || 0)}</p><p className="text-sm text-gray-500">Total Stock Units</p></div></div>
          </div>
        </div>
      </div>

      {warehouse?.notes && (<div className="bg-white rounded-xl shadow-sm overflow-hidden"><div className="px-6 py-4 border-b bg-green-50"><div className="flex items-center gap-2"><FileText className="w-4 h-4 text-green-700" /><h2 className="font-semibold text-green-800">Notes</h2></div></div><div className="p-6"><p className="text-gray-700">{warehouse.notes}</p></div></div>)}

      {inventory.length > 0 && (<div className="bg-white rounded-xl shadow-sm overflow-hidden"><div className="px-6 py-4 border-b bg-green-50"><h2 className="font-semibold text-green-800">Stock Details</h2></div><div className="overflow-x-auto"><table className="w-full"><thead><tr className="bg-gray-50"><th className="px-6 py-3 text-left text-xs font-semibold">Product</th><th className="px-6 py-3 text-left text-xs font-semibold">Current Stock</th><th className="px-6 py-3 text-left text-xs font-semibold">Unit</th><th className="px-6 py-3 text-left text-xs font-semibold">Last Updated</th></tr></thead><tbody>{inventory.map(item => (<tr key={item._id} className="border-b"><td className="px-6 py-4 font-medium text-green-800">{item.productName}</td><td className="px-6 py-4">{formatNumber(item.currentStock)}</td><td className="px-6 py-4">{item.unit}</td><td className="px-6 py-4 text-sm text-gray-500">{new Date(item.lastUpdated).toLocaleDateString()}</td></tr>))}</tbody></table></div></div>)}
    </div>
  );
};

export default ViewWarehouse;