import { BrowserRouter, Routes, Route } from "react-router-dom";

import NewAdminRoute from "./admin/components/AdminRoute";
import APDashboard from "./admin/pages/APDashboard";
import APProducts from "./admin/pages/APProducts";
import APOrders from "./admin/pages/APOrders";
import APCustomers from "./admin/pages/APCustomers";
import APReviews from "./admin/pages/APReviews";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/liora-admin" element={ <NewAdminRoute> <APDashboard /></NewAdminRoute> } />

      <Route path="/liora-admin/products" element={ <NewAdminRoute> <APProducts /></NewAdminRoute>}/>

      <Route path="/liora-admin/orders" element={ <NewAdminRoute> <APOrders /></NewAdminRoute> }/>

      <Route path="/liora-admin/customers" element={ <NewAdminRoute><APCustomers /> </NewAdminRoute>}/>

      <Route path="/liora-admin/reviews" element={ <NewAdminRoute> <APReviews /></NewAdminRoute>}/>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}