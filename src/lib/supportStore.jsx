const SUPPORT_KEY = "nomad_support_tickets";

// Mock inicial
const INITIAL_TICKETS = [
  {
    id: "tk_1",
    user_id: "mock_user_1",
    user_name: "João Silva",
    subject: "Dúvida sobre a aula 3",
    status: "open", // open, answered, closed
    created_at: new Date(Date.now() - 3600000).toISOString(),
    messages: [
      { sender: "student", text: "Não entendi muito bem como configurar o pixel na página de vendas. Pode me ajudar?", date: new Date(Date.now() - 3600000).toISOString() }
    ]
  }
];

export function getTickets() {
  try {
    const data = localStorage.getItem(SUPPORT_KEY);
    if (!data) {
      localStorage.setItem(SUPPORT_KEY, JSON.stringify(INITIAL_TICKETS));
      return INITIAL_TICKETS;
    }
    return JSON.parse(data).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } catch {
    return INITIAL_TICKETS;
  }
}

export function getUserTickets(userId) {
  const all = getTickets();
  return all.filter(t => t.user_id === userId);
}

export function createTicket(userId, userName, subject, message) {
  const tickets = getTickets();
  const newTicket = {
    id: `tk_${Date.now()}`,
    user_id: userId,
    user_name: userName,
    subject: subject,
    status: "open",
    created_at: new Date().toISOString(),
    messages: [
      { sender: "student", text: message, date: new Date().toISOString() }
    ]
  };
  
  tickets.push(newTicket);
  localStorage.setItem(SUPPORT_KEY, JSON.stringify(tickets));
  window.dispatchEvent(new Event("support_updated"));
  return newTicket;
}

export function replyTicket(ticketId, messageText) {
  const tickets = getTickets();
  const index = tickets.findIndex(t => t.id === ticketId);
  if (index === -1) return null;
  
  tickets[index].messages.push({
    sender: "producer",
    text: messageText,
    date: new Date().toISOString()
  });
  tickets[index].status = "answered";
  
  localStorage.setItem(SUPPORT_KEY, JSON.stringify(tickets));
  window.dispatchEvent(new Event("support_updated"));
  return tickets[index];
}

export function closeTicket(ticketId) {
  const tickets = getTickets();
  const index = tickets.findIndex(t => t.id === ticketId);
  if (index === -1) return null;
  
  tickets[index].status = "closed";
  localStorage.setItem(SUPPORT_KEY, JSON.stringify(tickets));
  window.dispatchEvent(new Event("support_updated"));
  return tickets[index];
}
