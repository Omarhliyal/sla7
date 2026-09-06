import { useState } from "react";

function CreateListing() {
  const [form, setForm] = useState({
    type: "sell",
    title: "",
    description: "",
    price: "",
    category_id: "",
    condition: "Used",
    city: "",
  });

  const [images, setImages] = useState([]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const newImages = Array.from(e.target.files);

    setImages((currentImages) => {
      const combined = [...currentImages, ...newImages];

      if (combined.length > 5) {
        alert("Maximum 5 images allowed.");
        return combined.slice(0, 5);
      }

      return combined;
    });

    e.target.value = "";
  };

  const removeImage = (index) => {
    setImages((currentImages) =>
      currentImages.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get logged-in user's Sanctum token
    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must be logged in to create a listing.");
      return;
    }

    const formData = new FormData();

    // Listing information
    formData.append("type", form.type);
    formData.append("category_id", form.category_id);
    formData.append("title", form.title);
    formData.append("description", form.description);

    // Only send price if the user entered one
    if (form.price !== "") {
      formData.append("price", form.price);
    }

    formData.append("condition", form.condition);
    formData.append("city", form.city);

    // Images
    images.forEach((image) => {
      formData.append("images[]", image);
    });

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/listings",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Laravel error:", data);

        if (data.errors) {
          console.error("Validation errors:", data.errors);
        }

        if (response.status === 401) {
          alert("Your session has expired. Please log in again.");

          localStorage.removeItem("token");
          localStorage.removeItem("user");

          return;
        }

        alert(data.message || "Something went wrong.");
        return;
      }

      console.log("Created listing:", data);

      alert("Listing created successfully! 🎉");

      // Reset form
      setForm({
        type: "sell",
        title: "",
        description: "",
        price: "",
        category_id: "",
        condition: "Used",
        city: "",
      });

      setImages([]);

    } catch (error) {
      console.error("Connection error:", error);
      alert("Could not connect to the Laravel server.");
    }
  };

  return (
    <main className="create-page">
      <div className="create-container">

        <p className="section-small">
          CREATE A LISTING
        </p>

        <h1>Create a listing</h1>

        <p className="create-description">
          Give something a second life.
        </p>

        <form
          className="create-form"
          onSubmit={handleSubmit}
        >

          {/* TYPE */}
          <div className="form-group">
            <label>
              What do you want to do?
            </label>

            <select
              name="type"
              value={form.type}
              onChange={handleChange}
            >
              <option value="sell">
                🏷️ Sell something
              </option>

              <option value="repair">
                🛠️ Repair something
              </option>

              <option value="giveaway">
                🎁 Give away
              </option>
            </select>
          </div>


          {/* PHOTOS */}
          <div className="form-group">
            <label>
              Photos
            </label>

            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              multiple
              onChange={handleImageChange}
            />

            <p className="image-help">
              Add up to 5 photos.
            </p>

            {images.length > 0 && (
              <div className="image-preview">

                {images.map((image, index) => (
                  <div
                    className="preview-item"
                    key={index}
                  >
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                    />

                    <button
                      type="button"
                      className="remove-image"
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}

              </div>
            )}
          </div>


          {/* TITLE */}
          <div className="form-group">
            <label>
              {form.type === "repair"
                ? "What needs to be repaired?"
                : form.type === "giveaway"
                ? "What are you giving away?"
                : "What are you selling?"}
            </label>

            <input
              name="title"
              type="text"
              placeholder={
                form.type === "repair"
                  ? "Example: Broken washing machine"
                  : form.type === "giveaway"
                  ? "Example: Old desk"
                  : "Example: Gaming PC GTX 1070"
              }
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>


          {/* DESCRIPTION */}
          <div className="form-group">
            <label>
              Description
            </label>

            <textarea
              name="description"
              placeholder={
                form.type === "repair"
                  ? "Describe the problem and what needs to be repaired..."
                  : form.type === "giveaway"
                  ? "Describe the item you want to give away..."
                  : "Describe your item..."
              }
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>


          {/* PRICE + CONDITION */}
          <div className="form-row">

            <div className="form-group">
              <label>
                {form.type === "repair"
                  ? "Repair budget (DH)"
                  : form.type === "giveaway"
                  ? "Price"
                  : "Price (DH)"}
              </label>

              <input
                name="price"
                type="number"
                min="0"
                placeholder={
                  form.type === "repair"
                    ? "Optional"
                    : form.type === "giveaway"
                    ? "Leave empty"
                    : "Leave empty if free"
                }
                value={form.price}
                onChange={handleChange}
              />
            </div>


            <div className="form-group">
              <label>
                Condition
              </label>

              <select
                name="condition"
                value={form.condition}
                onChange={handleChange}
              >
                <option value="New">
                  New
                </option>

                <option value="Like New">
                  Like New
                </option>

                <option value="Used">
                  Used
                </option>

                <option value="For Parts">
                  For Parts
                </option>
              </select>
            </div>

          </div>


          {/* CATEGORY + CITY */}
          <div className="form-row">

            <div className="form-group">
              <label>
                Category
              </label>

              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select category
                </option>

                <option value="1">
                  Electronics
                </option>

                <option value="2">
                  Furniture
                </option>

                <option value="3">
                  Clothing
                </option>

                <option value="4">
                  Vehicles
                </option>

                <option value="5">
                  Books
                </option>

                <option value="6">
                  Sports
                </option>

                <option value="7">
                  Other
                </option>
              </select>
            </div>


            <div className="form-group">
              <label>
                City
              </label>

              <input
                name="city"
                type="text"
                placeholder="Safi"
                value={form.city}
                onChange={handleChange}
                required
              />
            </div>

          </div>


          {/* SUBMIT */}
          <button
            type="submit"
            className="publish-btn"
          >
            {form.type === "repair"
              ? "Post repair request"
              : form.type === "giveaway"
              ? "Post giveaway"
              : "Publish listing"}
          </button>

        </form>

      </div>
    </main>
  );
}

export default CreateListing;