import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell, Trash2 } from "lucide-react";
import { api } from "../lib/api";

type Notification = {
  id: string;
  type: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
};

export default function NotificationBell({ userId, userRole, gradient = "linear-gradient(90deg, #b91c1c 0%, #991b1b 100%)", menuGradient }: { userId: string, userRole?: string, gradient?: string, menuGradient?: string }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isClearing, setIsClearing] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

  // Ensure userId is always email (should be passed as prop from parent, but add a defensive check)
  const safeUserId = userId || "";

  // Helper to detect dark mode
  const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');

  const fetchNotifications = async (reset = false) => {
    if (!safeUserId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/notifications?userId=${safeUserId}&page=${reset ? 0 : page}&size=10`);
      const data = res.data;
      setNotifications(reset ? data : [...notifications, ...data]);
      setHasMore(data.length === 10);
      if (reset) setPage(1);
      else setPage(page + 1);
    } catch (e) {
      console.log("Backend not available, cannot fetch notifications");
      setNotifications([]);
      setHasMore(false);
      if (reset) setPage(1);
      else setPage(page + 1);
    }
    setLoading(false);
  };

  const fetchUnreadCount = async () => {
    if (!safeUserId) return;
    try {
      const res = await api.get(`/api/notifications/unread-count?userId=${safeUserId}`);
      const count = res.data;
      setUnreadCount(count);
    } catch (e) {
      console.log("Backend not available, cannot fetch unread count");
      setUnreadCount(0);
    }
  };

  // Only show notifications for INFIRMIER_ST or MEDECIN_TRAVAIL
  useEffect(() => {
  fetchNotifications(true);
  fetchUnreadCount();
}, [userId]);

  useEffect(() => {
    if (open) fetchNotifications(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const markAsRead = async (id: string) => {
    try {
      await api.post(`/api/notifications/${id}/read`);
    } catch (e) {
      console.log("Backend not available, marking as read locally");
    }
    fetchNotifications(true);
    fetchUnreadCount();
  };

  const handleNotificationClick = async (n: Notification) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === n.id ? { ...notif, read: true } : notif
      )
    );
    await markAsRead(n.id);
    if (
      n.type === 'medical_visit_request' ||
      n.type === 'MEDICAL_VISIT_PROPOSAL' ||
      n.type === 'MEDICAL_VISIT_CONFIRMED'
    ) {
      if (userRole === 'MEDECIN_TRAVAIL') {
        router.push('/demande-visite-medicale-medecin');
      } else if (userRole === 'INFIRMIER_ST') {
        router.push('/demande-visite-medicale-infirmier');
      } else {
        router.push('/demande-visite-medicale');
      }
    } else {
      const lang = typeof window !== 'undefined' && window.localStorage.getItem('lang') || 'fr';
      router.push(`/notification-action?id=${n.id}&lang=${lang}`);
    }
  };

  const clearAllNotifications = async () => {
    if (!safeUserId) return;
    setIsClearing(true);
    try {
      await api.delete(`/api/notifications/clear-all?userId=${safeUserId}`);
    } catch (e) {}
    fetchNotifications(true);
    fetchUnreadCount();
    setIsClearing(false);
  };

  const deleteNotification = async (id: string) => {
    try {
      await api.delete(`/api/notifications/${id}`);
    } catch (e) {}
    fetchNotifications(true);
    fetchUnreadCount();
  };

  // Add interactive styles
  const [hover, setHover] = useState(false);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative"
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        style={{
          background: gradient,
          border: "none",
          borderRadius: "0.75rem",
          boxShadow: hover ? "0 6px 24px 0 #991b1b55, 0 2px 8px #eee" : "0 2px 8px #991b1b55, 0 2px 8px #eee",
          width: 44,
          height: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "box-shadow 0.2s, transform 0.15s",
          transform: hover ? "scale(1.07)" : "scale(1)"
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <Bell size={22} color="white" />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: 2,
              right: 2,
              minWidth: 18,
              height: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #e11d48 60%, #b31217 100%)",
              color: "#fff",
              borderRadius: "50%",
              fontSize: 12,
              fontWeight: 700,
              boxShadow: "0 1px 4px #b3121740",
              border: "2px solid #fff",
              zIndex: 2,
              letterSpacing: "0.2px",
              padding: "0 5px"
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div
          ref={dropdownRef}
          style={{
            position: "absolute",
            top: 48,
            right: 0,
            minWidth: 340,
            zIndex: 1000,
            borderRadius: 16,
            boxShadow: "0 8px 32px #0002",
            background: isDark ? "#181f2a" : "#fff",
            border: isDark ? "1px solid #222a" : "1px solid #eee",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 20px",
              borderBottom: isDark ? "1px solid #222a" : "1px solid #eee",
              background: menuGradient || gradient,
              color: "#fff"
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 18 }}>Notifications</span>
            <button
              style={{ background: "none", border: "none", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14 }}
              onClick={() => fetchNotifications(true)}
              title="Rafraîchir"
            >⟳</button>
          </div>
          <div style={{ maxHeight: 300, overflowY: "auto", background: isDark ? "#181f2a" : "#fff" }}>
            {loading && (
              <div style={{ padding: 32, textAlign: "center", color: isDark ? "#aaa" : "#888" }}>Chargement...</div>
            )}
            {!loading && notifications.length === 0 && (
              <div style={{ padding: 32, textAlign: "center", color: isDark ? "#aaa" : "#888" }}>Aucune notification</div>
            )}
            {notifications.map(n => (
              <div
                key={`${n.id}-${n.createdAt}`}
                style={{
                  padding: "14px 20px",
                  borderBottom: isDark ? "1px solid #222a" : "1px solid #f3f3f3",
                  background: n.read ? (isDark ? "#232b3b" : "#f9fafb") : (isDark ? "#232b3b" : "#fff"),
                  cursor: "pointer",
                  transition: "background 0.2s",
                  fontWeight: n.read ? 400 : 700,
                  color: n.read ? (isDark ? "#aaa" : "#888") : (isDark ? "#fff" : "#222"),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
                onClick={() => handleNotificationClick(n)}
              >
                <div style={{ flex: 1 }}>
                  <div>{n.message}</div>
                  <div style={{ fontSize: 12, color: isDark ? "#888" : "#aaa", marginTop: 4 }}>
                    {n.createdAt ? new Date(n.createdAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" }) : ""}
                  </div>
                </div>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    color: isDark ? "#f87171" : "#b91c1c",
                    marginLeft: 12,
                    cursor: "pointer"
                  }}
                  title="Supprimer"
                  onClick={e => {
                    e.stopPropagation();
                    deleteNotification(n.id);
                  }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
          {hasMore && notifications.length > 0 && (
            <button
              style={{
                width: "100%",
                padding: "12px 0",
                background: isDark ? "#232b3b" : "#f3f3f3",
                border: "none",
                borderTop: isDark ? "1px solid #222a" : "1px solid #eee",
                color: isDark ? "#f87171" : "#8B0000",
                fontWeight: 600,
                cursor: "pointer"
              }}
              onClick={() => fetchNotifications()}
              disabled={loading}
            >
              Afficher plus
            </button>
          )}
          <button
            style={{
              width: "100%",
              padding: "12px 0",
              background: isDark ? "#2d3748" : "#fff0f0",
              border: "none",
              borderTop: isDark ? "1px solid #222a" : "1px solid #eee",
              color: isDark ? "#f87171" : "#b91c1c",
              fontWeight: 700,
              cursor: notifications.length === 0 || isClearing ? "not-allowed" : "pointer"
            }}
            onClick={clearAllNotifications}
            disabled={loading || notifications.length === 0 || !safeUserId || isClearing}
          >
            {isClearing ? "Suppression..." : "Tout supprimer"}
          </button>
        </div>
      )}
    </div>
  );
}
