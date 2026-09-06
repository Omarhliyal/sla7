import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MyListings() {
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const loadListings = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/my-listings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
        return;
      }

      const data = await response.json();

      setListings(data);
    } catch (error) {
      console.error(
        "Error loading listings:",
        error
      );
    }

    setLoading(false);
  };

  useEffect(() => {
    loadListings();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this listing?"
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("token");

    setDeletingId(id);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/listings/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Could not delete listing."
        );

        setDeletingId(null);
        return;
      }

      setListings((currentListings) =>
        currentListings.filter(
          (listing) => listing.id !== id
        )
      );

      alert("Listing deleted successfully.");
    } catch (error) {
      console.error(
        "Delete error:",
        error
      );

      alert(
        "Could not connect to the server."
      );
    }

    setDeletingId(null);
  };

  const getTypeLabel = (type) => {
    if (type === "repair") {
      return "🛠️ Repair";
    }

    if (type === "giveaway") {
      return "🎁 Giveaway";
    }

    return "🏷️ For Sale";
  };

  const getPriceLabel = (listing) => {
    if (listing.type === "giveaway") {
      return "Free";
    }

    if (listing.type === "repair") {
      return listing.price
        ? `${Number(
            listing.price
          ).toLocaleString()} DH budget`
        : "Budget not specified";
    }

    return listing.price
      ? `${Number(
          listing.price
        ).toLocaleString()} DH`
      : "Free";
  };

  if (loading) {
    return (
      <main className="my-listings-page">
        <p className="message">
          Loading your listings...
        </p>
      </main>
    );
  }

  return (
    <main className="my-listings-page">

      <div className="my-listings-container">

        <div className="my-listings-header">

          <div>

            <p className="section-small">
              YOUR ACCOUNT
            </p>

            <h1>
              My Listings
            </h1>

            <p>
              Manage the things you've posted
              on Sla7.
            </p>

          </div>

          <button
            className="sell-btn"
            onClick={() =>
              navigate("/create-listing")
            }
          >
            + Sell something
          </button>

        </div>


        {listings.length === 0 ? (

          <div className="empty-listings">

            <div className="empty-icon">
              📦
            </div>

            <h2>
              No listings yet
            </h2>

            <p>
              You haven't posted anything yet.
            </p>

            <button
              className="publish-btn"
              onClick={() =>
                navigate("/create-listing")
              }
            >
              Create your first listing
            </button>

          </div>

        ) : (

          <div className="my-listings-grid">

            {listings.map((listing) => (

              <div
                className="my-listing-card"
                key={listing.id}
              >

                <div className="my-listing-image">

                  {listing.images &&
                  listing.images.length > 0 ? (

                    <img
                      src={`http://127.0.0.1:8000/storage/${listing.images[0].image}`}
                      alt={listing.title}
                    />

                  ) : (

                    <div className="no-image">
                      <span>📷</span>
                      <p>No image</p>
                    </div>

                  )}

                </div>


                <div className="my-listing-info">

                  <span className="listing-type">
                    {getTypeLabel(
                      listing.type
                    )}
                  </span>

                  <span className="listing-category">
                    {listing.category?.name}
                  </span>

                  <h3>
                    {listing.title}
                  </h3>

                  <p className="my-listing-price">
                    {getPriceLabel(listing)}
                  </p>

                  <p className="city">
                    📍 {listing.city}
                  </p>


                  <div className="my-listing-actions">

                    <button
                      className="view-btn"
                      onClick={() =>
                        navigate(
                          `/listing/${listing.id}`
                        )
                      }
                    >
                      View
                    </button>


                    <button
                      className="edit-btn"
                      onClick={() =>
                        navigate(
                          `/edit-listing/${listing.id}`
                        )
                      }
                    >
                      Edit
                    </button>


                    <button
                      className="delete-btn"
                      disabled={
                        deletingId === listing.id
                      }
                      onClick={() =>
                        handleDelete(
                          listing.id
                        )
                      }
                    >
                      {deletingId === listing.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </main>
  );
}

export default MyListings;