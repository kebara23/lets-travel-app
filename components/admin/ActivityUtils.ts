import { Plane, Users, MessageCircle, FileText, Bell, AlertTriangle } from "lucide-react";

// Centralized WhatsApp/redirect numbers or links could live here in the future.

/**
 * Build a deep-link path for recent activity items based on their payload.
 * Prioritizes resource_type and resource_id, falls back to legacy fields.
 * Falls back to "#" when we cannot resolve a destination.
 */
export function getRedirectPath(activity: any): string {
  if (!activity) return "#";

  // Priority 1: Use new resource_type and resource_id if available
  if (activity.resource_type && activity.resource_id) {
    const resourceType = activity.resource_type.toUpperCase();
    const resourceId = activity.resource_id;

    switch (resourceType) {
      case "TRIP":
        return `/admin/trips/${resourceId}`;
      case "CLIENT":
        return `/admin/clients/${resourceId}`;
      case "SOS":
        return `/admin/sos/${resourceId}`;
      case "MESSAGE":
        return `/admin/inbox?id=${resourceId}`;
      case "INVOICE":
        return `/admin/invoices/${resourceId}`;
      default:
        break;
    }
  }

  // Priority 2: Fallback to legacy event-based routing
  const type = (activity.entity_type || activity.type || "").toUpperCase();

  switch (type) {
    case "TRIP_UPDATE":
    case "ITINERARY_CHANGE":
      return activity.trip_id ? `/admin/trips/${activity.trip_id}` : "#";
    case "NEW_SOS":
      return activity.sos_id ? `/admin/sos/${activity.sos_id}` : "/admin/sos";
    case "CLIENT_UPDATE":
      return activity.client_id ? `/admin/clients/${activity.client_id}` : "#";
    case "NEW_MESSAGE":
      return activity.conversation_id
        ? `/admin/inbox?conversationId=${activity.conversation_id}`
        : "/admin/messages";
    default:
      // Priority 3: Fallback to legacy link helper when provided
      if (activity.entity_type || activity.type) {
        return getActivityLink(activity.entity_type || activity.type, activity.entity_id || null);
      }
      return "#";
  }
}

// Helper to get icon based on type
export const getNotificationIcon = (type: string) => {
  switch (type) {
    case "TRIP":
    case "active_trip": // compatibility
      return Plane;
    case "CLIENT":
    case "new_client": // compatibility
      return Users;
    case "MESSAGE":
    case "message": // compatibility
      return MessageCircle;
    case "INVOICE":
      return FileText;
    case "SOS":
    case "sos": // compatibility
      return AlertTriangle;
    case "activity_reminder":
      return Bell; // Or Calendar based on preference
    default:
      return Bell;
  }
};

// Helper to resolve route based on entity type and ID
export const getActivityLink = (type: string, id: string | null) => {
  if (!id) return "#";
  
  // Normalize type to handle cases (uppercase/lowercase)
  const normalizedType = type.toUpperCase();

  if (normalizedType.includes("TRIP") || type === "active_trip") return `/admin/trips/${id}`;
  if (normalizedType.includes("CLIENT") || type === "new_client") return `/admin/clients/${id}`;
  if (normalizedType.includes("EXPERIENCE") || normalizedType.includes("INSIDER")) return `/admin/insiders/${id}`;
  if (normalizedType.includes("MESSAGE")) return `/admin/messages?chatId=${id}`;
  if (normalizedType.includes("SOS")) return `/admin/sos`;
  if (normalizedType.includes("INVOICE")) return `/admin/invoices/${id}`; // Future proofing

  return "#";
};
