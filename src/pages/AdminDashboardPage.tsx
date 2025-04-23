
import React from "react";

const AdminDashboardPage: React.FC = () => (
  <div className="max-w-2xl mx-auto px-4 py-10">
    <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
    <div className="bg-white shadow p-4 rounded-md">
      <h2 className="text-lg font-semibold mb-2">Welcome Admin</h2>
      <p>You can view all users, manage vendors, and oversee delivery metrics from this panel.</p>
      <ul className="mt-4 list-disc list-inside text-gray-700 space-y-1">
        <li>View system analytics and reports</li>
        <li>Manage users and vendors</li>
        <li>Oversee payments and notifications</li>
      </ul>
    </div>
  </div>
);

export default AdminDashboardPage;
