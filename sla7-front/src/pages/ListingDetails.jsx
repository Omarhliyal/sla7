import { useEffect, useState } from "react";
import {
  useParams,
  useNavigate
} from "react-router-dom";

function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetch(
      `http://127.0.0.1:8000/api/listings/${id}`
    )
      .then((response) => response.json())
      .then((data) => {
        setListing(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(
          "Error loading listing:",
          error
        );

        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <p className="message">
        Loading...
      </p>
    );
  }

  if (!listing) {
    return (
      <p className="message">
        Listing not found.
      </p>
    );
  }

  const hasImages =
    listing.images &&
    listing.images.length > 0;

  const getTypeLabel = () => {
    if (listing.type === "repair") {
      return "🛠️ Repair Request";
    }

    if (listing.type === "giveaway") {
      return "🎁 Giveaway";
    }

    return "🏷️ For Sale";
  };

  const getPriceLabel = () => {
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

  const handleContact = () => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    navigate(
      `/messages/${listing.id}`
    );
  };

  return (
    <main className="details-page">

      {/* GALLERY */}

      <div className="details-gallery">

        <div className="details-image">

          {hasImages ? (
            <img
              src={`http://127.0.0.1:8000/storage/${listing.images[selectedImage].image}`}
              alt={listing.title}
            />
          ) : (
            <div className="no-image">
              <span>📷</span>
              <p>No image</p>
            </div>
          )}

        </div>

        {hasImages &&
          listing.images.length > 1 && (
            <div className="image-thumbnails">

              {listing.images.map(
                (image, index) => (
                  <button
                    key={image.id}
                    className={
                      selectedImage === index
                        ? "thumbnail active"
                        : "thumbnail"
                    }
                    onClick={() =>
                      setSelectedImage(index)
                    }
                  >
                    <img
                      src={`http://127.0.0.1:8000/storage/${image.image}`}
                      alt={`${listing.title} ${
                        index + 1
                      }`}
                    />
                  </button>
                )
              )}

            </div>
          )}

      </div>


      {/* INFORMATION */}

      <div className="details-info">

        {/* TYPE */}

        <span className="listing-type details-type">
          {getTypeLabel()}
        </span>


        {/* CATEGORY */}

        <span className="listing-category">
          {listing.category?.name}
        </span>


        {/* TITLE */}

        <h1>
          {listing.title}
        </h1>


        {/* PRICE */}

        <p className="details-price">
          {getPriceLabel()}
        </p>


        {/* CONDITION */}

        <span className="listing-condition">
          {listing.condition}
        </span>


        {/* CITY */}

        <p className="details-city">
          📍 {listing.city}
        </p>


        {/* DESCRIPTION */}

        <div className="details-description">

          <h2>
            Description
          </h2>

          <p>
            {listing.description}
          </p>

        </div>


        {/* SELLER */}

        <div className="seller-box">

          <p>
            Posted by
          </p>

          <strong>
            {listing.user?.name}
          </strong>

        </div>


        {/* CONTACT */}

        <button
          className="contact-btn"
          onClick={handleContact}
        >
          {listing.type === "repair"
            ? "Contact about repair"
            : listing.type === "giveaway"
            ? "Contact about giveaway"
            : "Contact seller"}
        </button>

      </div>

    </main>
  );
}

export default ListingDetails;