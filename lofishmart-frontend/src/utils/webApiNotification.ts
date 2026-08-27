/**
 * Browser Web Notifications API utility.
 *
 * Wraps the native Notifications API into a small, reusable helper layer so
 * components can trigger OS-level notifications without repeating the
 * permission/support checks. Safe to import in any environment — all functions
 * short-circuit when the API is unavailable (e.g. SSR, http non-secure context).
 */

/** Whether the browser supports the Notifications API. */
export function isWebApiNotificationSupported(): boolean {
	return typeof window !== "undefined" && "Notification" in window;
}

/** Current notification permission ("default" | "granted" | "denied"), or null when unsupported. */
export function getWebApiNotificationPermission(): NotificationPermission | null {
	if (!isWebApiNotificationSupported()) return null;
	return Notification.permission;
}

/**
 * Request permission to show notifications.
 *
 * Must be called from a user-gesture context (e.g. a button click / the serial
 * connect flow). Resolves to the granted permission, or null when unsupported.
 */
export async function requestWebApiNotificationPermission(): Promise<NotificationPermission | null> {
	if (!isWebApiNotificationSupported()) return null;
	if (Notification.permission === "granted") return Notification.permission;
	try {
		return await Notification.requestPermission();
	} catch {
		return Notification.permission;
	}
}

interface WebApiNotificationOptions {
	title: string;
	body?: string;
	icon?: string;
	/** Focus the tab when the notification is clicked. Defaults to true. */
	onClickFocus?: boolean;
}

/**
 * Show an OS-level notification.
 *
 * Silently does nothing when notifications are unsupported, permission has not
 * been granted, or the app is running in a non-secure context where the API is
 * unavailable.
 */
export function sendWebApiNotification({
	title,
	body = "",
	icon,
	onClickFocus = true,
}: WebApiNotificationOptions): boolean {
	if (!isWebApiNotificationSupported()) return false;
	if (Notification.permission !== "granted") return false;

	try {
		const notification = new Notification(title, {
			body,
			icon,
		});

		if (onClickFocus) {
			notification.onclick = () => {
				window.focus();
				notification.close();
			};
		}

		return true;
	} catch {
		return false;
	}
}
