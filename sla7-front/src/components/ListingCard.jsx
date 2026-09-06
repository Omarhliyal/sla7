import { useNavigate } from "react-router-dom";

function ListingCard({ listing }) {
  const navigate = useNavigate();

  const getTypeLabel = () => {
    if (listing.type === "repair") {
      return "🛠️ Repair";
    }

    if (listing.type === "giveaway") {
      return "🎁 Giveaway";
    }

    return "🏷️ For Sale";
  };

  return (
    <div className="listing-card">
      <div className="listing-image">
        {listing.images && listing.images.length > 0 ? (
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

      <div className="listing-info">

        <div className="listing-top">
          <span className="listing-category">
            {listing.category?.name}
          </span>

          <span className="listing-condition">
            {listing.condition}
          </span>
        </div>

        <span className="listing-type">
          {getTypeLabel()}
        </span>

        <h3>{listing.title}</h3>

        <p className="listing-description">
          {listing.description}
        </p>

        <div className="listing-bottom">
          <div>

            <p className="price">
              {listing.type === "giveaway"
                ? "Free"
                : listing.price
                ? `${Number(listing.price).toLocaleString()} DH`
                : listing.type === "repair"
                ? "Budget not specified"
                : "Free"}
            </p>

            <p className="city">
              📍 {listing.city}
            </p>

          </div>

          <button
            className="view-btn"
            onClick={() => navigate(`/listing/${listing.id}`)}
          >
            View
          </button>

        </div>

      </div>
    </div>
  );
}

export default ListingCard;