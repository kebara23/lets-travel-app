import { Plane, Users, MessageCircle, FileText, Bell, AlertTriangle } from "lucide-react";

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
