import User from "./pages/User.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
      const path = typeof window !== "undefined" ? window.location.pathname : "/";
      if (path === "/admin" || path.startsWith("/admin/")) {
        return <Admin />;
      }
      return <User />;
}
