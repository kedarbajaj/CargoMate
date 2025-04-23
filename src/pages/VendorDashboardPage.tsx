
import React from "react";

const VendorDashboardPage: React.FC = () => (
  <div className="max-w-2xl mx-auto px-4 py-10">
    <h1 className="text-2xl font-bold mb-4">Vendor Dashboard</h1>
    <div className="bg-white shadow p-4 rounded-md">
      <h2 className="text-lg font-semibold mb-2">Welcome Vendor</h2>
      <p>Your vendor dashboard lets you manage your deliveries and view analytics here.</p>
      <ul className="mt-4 list-disc list-inside text-gray-700 space-y-1">
        <li>See deliveries assigned to your company</li>
        <li>Track delivery statuses in real time</li>
        <li>Contact users and update shipping status</li>
      </ul>
    </div>
  </div>
);

export default VendorDashboardPage;
