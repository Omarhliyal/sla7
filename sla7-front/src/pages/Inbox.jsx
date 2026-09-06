import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Inbox() {
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const savedUser = localStorage.getItem("user");

  let user = null;

  try {
    user = savedUser ? JSON.parse(savedUser) : null;
  } catch (error) {
    console.error("User data error:", error);
  }

  useEffect(() => {
    if (!token || !user) {
      navigate("/login");
      return;
    }

    const loadConversations = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/conversations",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Could not load messages."
          );
        }

        const grouped = {};

        data.forEach((msg) => {
          const currentUserId = Number(user.id);
          const senderId = Number(msg.sender_id);

          const otherUser =
            senderId === currentUserId
              ? msg.receiver
              : msg.sender;

          if (!otherUser) {
            return;
          }

          const key = `${msg.listing_id}-${otherUser.id}`;

          if (!grouped[key]) {
            grouped[key] = {
              listing_id: msg.listing_id,
              listing: msg.listing,
              otherUser: otherUser,
              messages: [],
              unread: 0,
            };
          }

          grouped[key].messages.push(msg);

          // Count unread messages
          if (
            Number(msg.receiver_id) === currentUserId &&
            !msg.is_read
          ) {
            grouped[key].unread++;
          }
        });

        const conversationList = Object.values(grouped)
          .map((conversation) => {
            // Sort messages from oldest → newest
            conversation.messages.sort(
              (a, b) =>
                new Date(a.created_at) -
                new Date(b.created_at)
            );

            return conversation;
          })
          .sort((a, b) => {
            // Sort conversations by newest message
            const lastA =
              a.messages[a.messages.length - 1];

            const lastB =
              b.messages[b.messages.length - 1];

            return (
              new Date(lastB.created_at) -
              new Date(lastA.created_at)
            );
          });

        setConversations(conversationList);
        setError("");
      } catch (error) {
        console.error(
          "Error loading conversations:",
          error
        );

        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();

    const interval = setInterval(
      loadConversations,
      5000
    );

    return () => {
      clearInterval(interval);
    };
  }, [navigate, token]);

  if (loading) {
    return (
      <main className="messages-page">
        <div className="messages-container">
          <p className="message">
            Loading messages...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="messages-page">
      <div className="messages-container">

        <div className="inbox-header">
          <p className="section-small">
            YOUR INBOX
          </p>

          <h1>
            Messages
          </h1>
        </div>

        {error && (
          <p className="auth-error">
            {error}
          </p>
        )}

        {conversations.length === 0 ? (
          <div className="no-messages inbox-empty">
            <span>💬</span>

            <h3>
              No messages yet
            </h3>

            <p>
              When someone contacts you about a
              listing, the conversation will appear
              here.
            </p>
          </div>
        ) : (
          <div className="inbox-list">

            {conversations.map((conversation) => {

              // Last message is now guaranteed to be newest
              const lastMessage =
                conversation.messages[
                  conversation.messages.length - 1
                ];

              return (
                <button
                  key={`${conversation.listing_id}-${conversation.otherUser.id}`}
                  className="conversation-card"
                  onClick={() =>
                    navigate(
                      `/messages/${conversation.listing_id}`
                    )
                  }
                >

                  <div className="conversation-avatar">
                    {conversation.otherUser.name
                      ?.charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="conversation-content">

                    <div className="conversation-top">

                      <strong>
                        {conversation.otherUser.name}
                      </strong>

                      <span>
                        {new Date(
                          lastMessage.created_at
                        ).toLocaleDateString([], {
                          day: "2-digit",
                          month: "short",
                        })}
                      </span>

                    </div>

                    <p className="conversation-listing">
                      {conversation.listing?.title ||
                        `Listing #${conversation.listing_id}`}
                    </p>

                    <p className="conversation-last-message">

                      {Number(lastMessage.sender_id) ===
                      Number(user.id)
                        ? "You: "
                        : ""}

                      {lastMessage.message}

                    </p>

                  </div>

                  {conversation.unread > 0 && (
                    <span className="conversation-unread">
                      {conversation.unread}
                    </span>
                  )}

                </button>
              );
            })}

          </div>
        )}

      </div>
    </main>
  );
}

export default Inbox;