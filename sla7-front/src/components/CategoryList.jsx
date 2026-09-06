function CategoryList({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedType,
  onSelectType,
}) {
  return (
    <>
      {/* TYPE FILTERS */}
      <div className="type-filters">
        <button
          className={
            selectedType === null
              ? "type-filter active"
              : "type-filter"
          }
          onClick={() => onSelectType(null)}
        >
          All
        </button>

        <button
          className={
            selectedType === "sell"
              ? "type-filter active"
              : "type-filter"
          }
          onClick={() => onSelectType("sell")}
        >
          🏷️ For Sale
        </button>

        <button
          className={
            selectedType === "repair"
              ? "type-filter active"
              : "type-filter"
          }
          onClick={() => onSelectType("repair")}
        >
          🛠️ Repair
        </button>

        <button
          className={
            selectedType === "giveaway"
              ? "type-filter active"
              : "type-filter"
          }
          onClick={() => onSelectType("giveaway")}
        >
          🎁 Giveaway
        </button>
      </div>

      {/* CATEGORY FILTERS */}
      <div className="categories">
        <button
          className={
            selectedCategory === null
              ? "category active"
              : "category"
          }
          onClick={() => onSelectCategory(null)}
        >
          All Categories
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            className={
              selectedCategory === category.id
                ? "category active"
                : "category"
            }
            onClick={() => onSelectCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
    </>
  );
}

export default CategoryList;