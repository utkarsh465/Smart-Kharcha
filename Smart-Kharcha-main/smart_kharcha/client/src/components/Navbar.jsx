import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-blue-600">
        Expense Tracker
      </h1>

      <div className="space-x-6">
        <Link to="/dashboard" className="hover:text-blue-600">
          Dashboard
        </Link>

        <Link to="/" className="hover:text-blue-600">
          Login
        </Link>

        <Link to="/register" className="hover:text-blue-600">
          Register
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;