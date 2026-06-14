import { useEffect, useState } from "react";
import {
  formatRelativeTime,
  formatTimestamp,
} from "../utils/dateHelpers.js";

function NotificationPanel({
  notifications,
  loading,
  error,
  onMarkAsRead,
  onMarkAllAsRead,
  onRefresh,
  updatingId,
  markingAllAsRead,
}) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification?.isRead
  ).length;

  return (
    <div className="absolute right-0 top-full z-30 mt-4 w-[22rem] overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/90 shadow-2xl shadow-slate-950/50 backdrop-blur-2xl">
      <div className="border-b border-white/10 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-aqua">
              Notifications
            </p>
            <h2 className="mt-2 text-lg font-semibold text-white">
              Activity Updates
            </h2>
          </div>

          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
            {unreadCount} unread
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-full border border-white/12 bg-white/8 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:border-aqua/40 hover:bg-aqua/10"
          >
            Refresh
          </button>

          <button
            type="button"
            onClick={onMarkAllAsRead}
            disabled={markingAllAsRead || unreadCount === 0}
            className="rounded-full border border-white/12 bg-white/8 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:border-aqua/40 hover:bg-aqua/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {markingAllAsRead ? "Saving..." : "Mark All As Read"}
          </button>
        </div>
      </div>

      <div className="max-h-[28rem] overflow-y-auto px-3 py-3">
        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-300">
            Loading notifications...
          </div>
        ) : null}

        {!loading && error ? (
          <div className="rounded-3xl border border-red-400/30 bg-red-500/10 px-4 py-6 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {!loading && !error && notifications.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-300">
            No notifications yet. Order and status updates will appear here.
          </div>
        ) : null}

        {!loading && !error && notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const isRead = Boolean(notification?.isRead);

              return (
                <article
                  key={notification.id}
                  className={[
                    "rounded-3xl border px-4 py-4 transition",
                    isRead
                      ? "border-white/8 bg-white/[0.03] text-slate-400"
                      : "border-aqua/20 bg-aqua/10 text-slate-200 shadow-lg shadow-aqua/5",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        {notification?.title || "Notification"}
                      </h3>
                      <p className="mt-2 text-sm leading-6">
                        {notification?.message || "No message available."}
                      </p>
                    </div>

                    <span
                      className={[
                        "shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]",
                        isRead
                          ? "border-white/10 bg-white/5 text-slate-400"
                          : "border-aqua/30 bg-aqua/15 text-aqua",
                      ].join(" ")}
                    >
                      {isRead ? "Read" : "Unread"}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        {formatRelativeTime(notification?.createdAt, now)}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {formatTimestamp(notification?.createdAt)}
                      </p>
                    </div>

                    {!isRead ? (
                      <button
                        type="button"
                        onClick={() => onMarkAsRead(notification.id)}
                        disabled={updatingId === notification.id}
                        className="rounded-full border border-white/12 bg-white/8 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:border-aqua/40 hover:bg-aqua/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {updatingId === notification.id
                          ? "Saving..."
                          : "Mark as Read"}
                      </button>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default NotificationPanel;
