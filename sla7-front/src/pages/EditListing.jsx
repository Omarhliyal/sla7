import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    type: "sell",
    title: "",
    description: "",
    price: "",
    category_id: "",
    condition: "Used",
    city: "",
  });

  const [oldImages, setOldImages] = useState([]);
  const [images, setImages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    fetch(
      `http://127.0.0.1:8000/api/listings/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    )
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Could not load listing."
          );
        }

        return data;
      })
      .then((data) => {
        const currentUser = JSON.parse(
          localStorage.getItem("user")
        );

        // Extra frontend protection
        if (
          !currentUser ||
          data.user_id !== currentUser.id
        ) {
          alert(
            "You can only edit your own listings."
          );

          navigate("/my-listings");
          return;
        }

        setForm({
          type: data.type || "sell",
          title: data.title || "",
          description: data.description || "",
          price: data.price || "",
          category_id: data.category_id || "",
          condition: data.condition || "Used",
          city: data.city || "",
        });

        setOldImages(data.images || []);

        setLoading(false);
      })
      .catch((error) => {
        console.error(
          "Error loading listing:",
          error
        );

        setError(error.message);
        setLoading(false);
      });
  }, [id, navigate]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const newImages = Array.from(e.target.files);

    setImages((currentImages) => {
      const combined = [
        ...currentImages,
        ...newImages,
      ];

      if (combined.length > 5) {
        alert("Maximum 5 images allowed.");
        return combined.slice(0, 5);
      }

      return combined;
    });

    e.target.value = "";
  };

  const removeNewImage = (index) => {
    setImages((currentImages) =>
      currentImages.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    setSaving(true);
    setError("");

    const formData = new FormData();

    formData.append("type", form.type);
    formData.append(
      "category_id",
      form.category_id
    );
    formData.append("title", form.title);
    formData.append(
      "description",
      form.description
    );

    if (form.price !== "") {
      formData.append("price", form.price);
    }

    formData.append(
      "condition",
      form.condition
    );

    formData.append("city", form.city);

    images.forEach((image) => {
      formData.append("images[]", image);
    });

    // Laravel method spoofing
    formData.append("_method", "PUT");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/listings/${id}`,
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

      console.log("UPDATE RESPONSE:", data);

      if (!response.ok) {
        if (data.errors) {
          const firstError =
            Object.values(data.errors)[0][0];

          setError(firstError);
        } else {
          setError(
            data.message ||
              "Could not update listing."
          );
        }

        setSaving(false);
        return;
      }

      alert("Listing updated successfully! 🎉");

      navigate("/my-listings");
    } catch (error) {
      console.error(
        "Update error:",
        error
      );

      setError(
        "Could not connect to the server."
      );
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <main className="create-page">
        <p className="message">
          Loading listing...
        </p>
      </main>
    );
  }

  if (error && !form.title) {
    return (
      <main className="create-page">
        <p className="message">
          {error}
        </p>
      </main>
    );
  }

  return (
    <main className="create-page">
      <div className="create-container">

        <p className="section-small">
          MANAGE LISTING
        </p>

        <h1>Edit listing</h1>

        <p className="create-description">
          Update your listing information.
        </p>

        <form
          className="create-form"
          onSubmit={handleSubmit}
        >

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


          <div className="form-group">
            <label>
              Photos
            </label>

            {oldImages.length > 0 && (
              <>
                <p className="image-help">
                  Current photos
                </p>

                <div className="image-preview">
                  {oldImages.map((image) => (
                    <div
                      className="preview-item"
                      key={image.id}
                    >
                      <img
                        src={`http://127.0.0.1:8000/storage/${image.image}`}
                        alt="Current listing"
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            <p className="image-help">
              Upload new photos to replace the
              current ones. Maximum 5.
            </p>

            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              multiple
              onChange={handleImageChange}
            />

            {images.length > 0 && (
              <div className="image-preview">
                {images.map((image, index) => (
                  <div
                    className="preview-item"
                    key={index}
                  >
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`New preview ${index + 1}`}
                    />

                    <button
                      type="button"
                      className="remove-image"
                      onClick={() =>
                        removeNewImage(index)
                      }
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>


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
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>


          <div className="form-group">
            <label>
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>


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
                value={form.city}
                onChange={handleChange}
                required
              />
            </div>

          </div>


          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}


          <button
            type="submit"
            className="publish-btn"
            disabled={saving}
          >
            {saving
              ? "Saving changes..."
              : "Save changes"}
          </button>

        </form>
      </div>
    </main>
  );
}

export default EditListing;