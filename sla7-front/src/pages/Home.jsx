import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import CategoryList from "../components/CategoryList";
import ListingCard from "../components/ListingCard";

function Home() {
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedType, setSelectedType] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/listings")
      .then((response) => response.json())
      .then((data) => {
        setListings(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading listings:", error);
        setLoading(false);
      });

    fetch("http://127.0.0.1:8000/api/categories")
      .then((response) => response.json())
      .then((data) => {
        setCategories(data);
      })
      .catch((error) => {
        console.error("Error loading categories:", error);
      });
  }, []);

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.title
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      listing.description
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === null ||
      listing.category_id === selectedCategory;

    const matchesType =
      selectedType === null ||
      listing.type === selectedType;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesType
    );
  });

  return (
    <main>
      {/* HERO */}
      <section className="hero">
        <div className="hero-content">

          <p className="hero-small">
            YOUR LOCAL MARKETPLACE
          </p>

          <h1>
            Find things around you.
            <br />
            Give them a second life.
          </h1>

          <p className="hero-description">
            Buy, sell, repair or give away things you no longer need.
            <br />
            Simple. Local. Free.
          </p>

          <SearchBar onSearch={setSearch} />

        </div>
      </section>

      {/* MARKETPLACE */}
      <section className="marketplace">

        <div className="section-header">
          <div>
            <p className="section-small">
              EXPLORE
            </p>

            <h2>
              Categories
            </h2>
          </div>
        </div>

        {/* TYPE + CATEGORY FILTERS */}
        <CategoryList
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedType={selectedType}
          onSelectType={setSelectedType}
        />

        {/* LISTINGS HEADER */}
        <div className="listings-header">

          <div>
            <p className="section-small">
              MARKETPLACE
            </p>

            <h2>
              Latest listings
            </h2>
          </div>

          <span>
            {filteredListings.length} items
          </span>

        </div>

        {/* LISTINGS */}
        {loading ? (
          <p className="message">
            Loading listings...
          </p>
        ) : filteredListings.length === 0 ? (
          <p className="message">
            No listings found.
          </p>
        ) : (
          <div className="listing-grid">

            {filteredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
              />
            ))}

          </div>
        )}

      </section>
    </main>
  );
}

export default Home;