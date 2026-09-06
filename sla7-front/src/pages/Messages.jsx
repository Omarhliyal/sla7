import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function Messages() {
  const { listingId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [listing, setListing] = useState(null);

  const [message, setMessage] = useState("");
  const [receiverId, setReceiverId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token || !user) {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      try {
        /*
        |--------------------------------------------------------------------------
        | Load listing
        |--------------------------------------------------------------------------
        */

        const listingResponse = await fetch(
          `http://127.0.0.1:8000/api/listings/${listingId}`
        );

        const listingData =
          await listingResponse.json();

        if (!listingResponse.ok) {
          throw new Error(
            "Could not load listing."
          );
        }

        setListing(listingData);


        /*
        |--------------------------------------------------------------------------
        | Load messages
        |--------------------------------------------------------------------------
        */

        const messageResponse = await fetch(
          `http://127.0.0.1:8000/api/messages/${listingId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const messageData =
          await messageResponse.json();

        if (!messageResponse.ok) {
          throw new Error(
            messageData.message ||
              "Could not load messages."
          );
        }

        setMessages(messageData);


        /*
        |--------------------------------------------------------------------------
        | Find the other person
        |--------------------------------------------------------------------------
        */

        let otherUserId = null;

        if (messageData.length > 0) {
          const firstMessage = messageData[0];

          const otherUser =
            firstMessage.sender_id === user.id
              ? firstMessage.receiver
              : firstMessage.sender;

          otherUserId = otherUser.id;

          setReceiverId(otherUserId);
        } else {
          /*
          |--------------------------------------------------------------------------
          | No messages yet
          |--------------------------------------------------------------------------
          |
          | If we are the buyer, the first message
          | goes to the listing owner.
          |
          */

          if (listingData.user_id !== user.id) {
            otherUserId = listingData.user_id;

            setReceiverId(otherUserId);
          }
        }


        /*
        |--------------------------------------------------------------------------
        | Mark ONLY this conversation as read
        |--------------------------------------------------------------------------
        */

        if (otherUserId) {
          await fetch(
            `http://127.0.0.1:8000/api/messages/${listingId}/read`,
            {
              method: "POST",

              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "application/json",
              },

              body: JSON.stringify({
                other_user_id: otherUserId,
              }),
            }
          );
        }

      } catch (error) {
        console.error(error);
        setError(error.message);
      }

      setLoading(false);
    };

    loadData();

  }, [listingId, navigate]);


  /*
  |--------------------------------------------------------------------------
  | Send message
  |--------------------------------------------------------------------------
  */

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      return;
    }

    if (!receiverId) {
      setError(
        "Could not determine who to send the message to."
      );
      return;
    }

    setSending(true);
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/messages",
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            listing_id: Number(listingId),
            receiver_id: receiverId,
            message: message.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Could not send message."
        );

        setSending(false);
        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Add new message to the screen immediately
      |--------------------------------------------------------------------------
      */

      setMessages((currentMessages) => [
        ...currentMessages,
        data,
      ]);

      setMessage("");

    } catch (error) {
      console.error(error);

      setError(
        "Could not connect to the server."
      );
    }

    setSending(false);
  };


  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="messages-page">
        <p className="message">
          Loading conversation...
        </p>
      </main>
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Page
  |--------------------------------------------------------------------------
  */

  return (
    <main className="messages-page">

      <div className="messages-container">

        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>


        {listing && (
          <div className="conversation-header">

            <div className="conversation-image">

              {listing.images?.length > 0 ? (
                <img
                  src={`http://127.0.0.1:8000/storage/${listing.images[0].image}`}
                  alt={listing.title}
                />
              ) : (
                <span>📷</span>
              )}

            </div>


            <div>

              <p className="section-small">
                ABOUT LISTING
              </p>

              <h1>
                {listing.title}
              </h1>

              <p>
                {listing.city}
              </p>

            </div>

          </div>
        )}


        <div className="messages-box">

          <div className="messages-list">

            {messages.length === 0 ? (

              <div className="no-messages">

                <span>💬</span>

                <h3>
                  Start the conversation
                </h3>

                <p>
                  Send a message to the seller.
                </p>

              </div>

            ) : (

              messages.map((item) => {

                const isMine =
                  item.sender_id === user.id;

                return (
                  <div
                    key={item.id}
                    className={
                      isMine
                        ? "message-row mine"
                        : "message-row"
                    }
                  >

                    <div className="message-bubble">

                      <p>
                        {item.message}
                      </p>

                      <span>
                        {new Date(
                          item.created_at
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                    </div>

                  </div>
                );

              })

            )}

          </div>


          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}


          <form
            className="message-form"
            onSubmit={sendMessage}
          >

            <input
              type="text"
              placeholder="Write a message..."
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              maxLength={2000}
            />

            <button
              type="submit"
              disabled={sending}
            >
              {sending
                ? "Sending..."
                : "Send"}
            </button>

          </form>

        </div>

      </div>

    </main>
  );
}

export default Messages;