import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import ListingDetails from "./pages/ListingDetails";
import CreateListing from "./pages/CreateListing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyListings from "./pages/MyListings";
import EditListing from "./pages/EditListing";
import Messages from "./pages/Messages";
import Inbox from "./pages/Inbox";

function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        {/* Home */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* Listing details */}
        <Route
          path="/listing/:id"
          element={<ListingDetails />}
        />

        {/* Create listing */}
        <Route
          path="/create-listing"
          element={<CreateListing />}
        />

        {/* Authentication */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* My listings */}
        <Route
          path="/my-listings"
          element={<MyListings />}
        />

        {/* Edit listing */}
        <Route
          path="/edit-listing/:id"
          element={<EditListing />}
        />

        {/* Messages inbox */}
        <Route
          path="/messages"
          element={<Inbox />}
        />

        {/* Individual conversation */}
        <Route
          path="/messages/:listingId"
          element={<Messages />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;