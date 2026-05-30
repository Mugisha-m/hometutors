import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import PrimaryButton from "../components/PrimaryButton";
import { getUserId, getUserRole } from "../lib/auth";
import { useTranslation } from "react-i18next";

interface Message {
  id: string;
  subject: string;
  body: string;
  read: boolean;
  createdAt: string;
  sender: {
    id: string;
    phone: string;
  };
  receiver: {
    id: string;
    phone: string;
  };
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

interface UserItem {
  id: string;
  phone: string;
  email?: string;
  role: string;
}

const MessagesPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [activeTab, setActiveTab] = useState<"messages" | "notifications">("messages");
  const [messageView, setMessageView] = useState<"inbox" | "sent">("inbox");
  const [showCompose, setShowCompose] = useState(false);
  const [composeForm, setComposeForm] = useState({
    receiverId: "",
    subject: "",
    body: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const userRole = getUserRole();
  const currentUserId = getUserId();
  const filteredMessages = messages.filter((message) =>
    messageView === "inbox"
      ? message.receiver.id === currentUserId
      : message.sender.id === currentUserId
  );

  useEffect(() => {
    const token = localStorage.getItem("hometutors_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const currentUserId = getUserId();
        const [messagesRes, notificationsRes, usersRes] = await Promise.all([
          api.get(
            userRole === "ADMIN"
              ? "/api/admin/messages"
              : "/api/messages/messages",
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          api.get(
            userRole === "ADMIN"
              ? "/api/admin/notifications"
              : "/api/messages/notifications",
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          api.get("/api/auth/users", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setMessages(messagesRes.data.data);
        setNotifications(notificationsRes.data.data);
        setUsers(usersRes.data.data.filter((user: UserItem) => user.id !== currentUserId));
      } catch (error) {
        setError(t('messages.loadError'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate, t]);

  const markMessageRead = async (messageId: string) => {
    const token = localStorage.getItem("hometutors_token");
    if (!token) return;

    try {
      await api.put(`/api/messages/messages/${messageId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, read: true } : msg)));
    } catch {
      setError(t('messages.markReadError'));
    }
  };

  const markNotificationRead = async (notificationId: string) => {
    const token = localStorage.getItem("hometutors_token");
    if (!token) return;

    try {
      await api.put(`/api/messages/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications((prev) => prev.map((notif) => (notif.id === notificationId ? { ...notif, read: true } : notif)));
    } catch {
      setError(t('messages.markReadError'));
    }
  };

  const deleteMessage = async (messageId: string) => {
    const token = localStorage.getItem("hometutors_token");
    if (!token) return;

    try {
      await api.delete(`/api/admin/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    } catch {
      setError(t('messages.deleteError'));
    }
  };

  const sendMessage = async () => {
    const token = localStorage.getItem("hometutors_token");
    if (!token) return;

    try {
      const response = await api.post("/api/messages/send-message", composeForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const newMessage = response.data.data;
      if (newMessage && newMessage.id) {
        setMessages((prev) => [newMessage, ...prev]);
      }
      setComposeForm({ receiverId: "", subject: "", body: "" });
      setShowCompose(false);
    } catch {
      setError(t('messages.sendError'));
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] bg-white p-8 shadow-lg">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-turquoise">{t('messages.title')}</p>
            <h1 className="text-3xl font-bold text-charcoal">{t('messages.heading')}</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab("messages")}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${activeTab === "messages" ? "bg-turquoise text-white" : "bg-slate-100 text-slate-600"}`}
            >
              {t('messages.tabMessages')} ({messages.length})
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${activeTab === "notifications" ? "bg-turquoise text-white" : "bg-slate-100 text-slate-600"}`}
            >
              {t('messages.tabNotifications')} ({notifications.length})
            </button>
            <PrimaryButton label={showCompose ? t('messages.hideCompose') : t('messages.compose')} onClick={() => setShowCompose((prev) => !prev)} />
          </div>
        </div>
      </div>

      {error && <div className="rounded-3xl bg-crimson/10 p-4 text-sm text-crimson">{error}</div>}

      {showCompose && (
        <div className="rounded-[32px] bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-charcoal">{t('messages.composeTitle')}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-charcoal">{t('messages.receiver')}</span>
              <select
                value={composeForm.receiverId}
                onChange={(e) => setComposeForm((prev) => ({ ...prev, receiverId: e.target.value }))}
                className="w-full"
              >
                <option value="">{t('messages.selectReceiver')}</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.phone} {user.email ? `(${user.email})` : ""} - {user.role}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-charcoal">{t('messages.subject')}</span>
              <input
                value={composeForm.subject}
                onChange={(e) => setComposeForm((prev) => ({ ...prev, subject: e.target.value }))}
                placeholder={t('messages.subjectPlaceholder')}
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-charcoal">{t('messages.body')}</span>
              <textarea
                value={composeForm.body}
                onChange={(e) => setComposeForm((prev) => ({ ...prev, body: e.target.value }))}
                placeholder={t('messages.bodyPlaceholder')}
                rows={4}
              />
            </label>
          </div>
          <div className="mt-6 flex flex-col gap-3 md:flex-row md:justify-end">
            <button
              onClick={() => setShowCompose(false)}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300"
            >
              {t('messages.cancel')}
            </button>
            <PrimaryButton label={t('messages.send')} onClick={sendMessage} />
          </div>
        </div>
      )}

      <div className="rounded-[32px] bg-white p-8 shadow-sm">
        {activeTab === "messages" ? (
          <div>
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-charcoal">{t('messages.inbox')}</h2>
                <p className="text-sm text-slate-500">{t('messages.messageTabDescription')}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setMessageView("inbox")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${messageView === "inbox" ? "bg-turquoise text-white" : "bg-slate-100 text-slate-600"}`}
                >
                  {t('messages.inbox')} ({messages.filter((message) => message.receiver.id === currentUserId).length})
                </button>
                <button
                  onClick={() => setMessageView("sent")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${messageView === "sent" ? "bg-turquoise text-white" : "bg-slate-100 text-slate-600"}`}
                >
                  {t('messages.sent')} ({messages.filter((message) => message.sender.id === currentUserId).length})
                </button>
              </div>
            </div>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-28 animate-pulse rounded-3xl bg-slate-100" />
                ))}
              </div>
            ) : filteredMessages.length === 0 ? (
              <p className="text-slate-500">{t('messages.empty')}</p>
            ) : (
              <div className="space-y-4">
                {filteredMessages
                  .map((message) => (
                    <div key={message.id} className={`rounded-3xl border p-5 ${message.read ? "border-slate-200" : "border-turquoise bg-turquoise/5"}`}>
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-semibold text-charcoal">{message.subject}</p>
                          <p className="text-sm text-slate-600">
                            {messageView === "inbox"
                              ? `${t('messages.from')} ${message.sender.phone}`
                              : `${t('messages.to')} ${message.receiver.phone}`}
                          </p>
                          <p className="text-xs text-slate-500">{new Date(message.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {!message.read && messageView === "inbox" && (
                            <button
                              onClick={() => markMessageRead(message.id)}
                              className="rounded-full bg-turquoise px-3 py-1 text-xs text-white"
                            >
                              {t('messages.markRead')}
                            </button>
                          )}
                          {userRole === "ADMIN" && (
                            <button
                              onClick={() => deleteMessage(message.id)}
                              className="rounded-full bg-crimson px-3 py-1 text-xs text-white"
                            >
                              {t('messages.delete')}
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="mt-4 text-slate-700">{message.body}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="mb-6 text-xl font-semibold text-charcoal">{t('messages.notifications')}</h2>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-20 animate-pulse rounded-3xl bg-slate-100" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <p className="text-slate-500">{t('messages.notificationsEmpty')}</p>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className={`rounded-3xl border p-5 ${notification.read ? "border-slate-200" : "border-turquoise bg-turquoise/5"}`}>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-charcoal">{notification.title}</p>
                        <p className="text-sm text-slate-600">{notification.message}</p>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => markNotificationRead(notification.id)}
                          className="rounded-full bg-turquoise px-3 py-1 text-xs text-white"
                        >
                          {t('messages.markRead')}
                        </button>
                      )}
                    </div>
                    <p className="mt-3 text-xs text-slate-500">{new Date(notification.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default MessagesPage;