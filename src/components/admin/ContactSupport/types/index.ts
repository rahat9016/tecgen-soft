export interface ISupportTicket {
  id: string; // Ticket ID
  createdAt: string; // YYYY-MM-DD
  name: string; // User name
  phone: string; // Phone number
  email: string; // Email
  message: string; // Message preview
  status: "Pending" | "In progress" | "Resolved"; // Status
}

export interface IContactInfo {
  phones: string[];
  emails: string[];
  office_hour: string;
}
