// Sample data for development - will be replaced with real data from backend
const generateGroupMembers = () => {
  const roles = ['admin', 'member', 'member', 'member', 'member', 'member', 'member'];
  return Array.from({ length: 7 }, (_, i) => ({
    id: `member-${i + 1}`,
    name: `${['Sarah', 'John', 'Emma', 'Michael', 'Lisa', 'David', 'Anna'][i]} ${['Johnson', 'Smith', 'Wilson', 'Brown', 'Davis', 'Miller', 'Taylor'][i]}`,
    avatar: `https://randomuser.me/api/portraits/${i % 2 ? 'men' : 'women'}/${i + 1}.jpg`,
    role: roles[i],
    isOnline: Math.random() > 0.5,
    lastActive: new Date().toISOString(),
    messageCount: Math.floor(Math.random() * 200),
    email: `member${i + 1}@example.com`,
    phone: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    joinedAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString(),
    performance: {
      tasksCompleted: Math.floor(Math.random() * 50),
      messagesSent: Math.floor(Math.random() * 200),
      pollsCreated: Math.floor(Math.random() * 10)
    },
    paymentInfo: {
      id: `payment-${i + 1}`,
      name: `${['Sarah', 'John', 'Emma', 'Michael', 'Lisa', 'David', 'Anna'][i]} ${['Johnson', 'Smith', 'Wilson', 'Brown', 'Davis', 'Miller', 'Taylor'][i]}`,
      accountType: ['Savings', 'Checking'][Math.floor(Math.random() * 2)]
    }
  }));
};

export const dummyChats = [
  {
    id: 1,
    name: "John Smith",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    isGroup: false,
    isOnline: true,
    isPinned: true,
    lastSeen: "2 minutes ago",
    lastMessage: {
      text: "Can you send me those files?",
      sender: "John Smith",
      status: "read",
    },
    timestamp: new Date(new Date().getTime() - 15 * 60000).toISOString(),
    unreadCount: 0,
  },
  {
    id: 2,
    name: "Marketing Team",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    isGroup: true,
    members: generateGroupMembers(),
    isOnline: false,
    isPinned: true,
    lastMessage: {
      text: "Meeting scheduled for tomorrow at 10 AM",
      sender: "Sarah Johnson",
      status: "delivered"
    },
    timestamp: new Date().toISOString(),
    unreadCount: 3
  },
  {
    id: 3,
    name: "Emma Wilson",
    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    isGroup: false,
    isOnline: true,
    isTyping: true,
    lastSeen: "online",
    lastMessage: {
      text: "Let's discuss the project details",
      sender: "Emma Wilson",
      status: "delivered",
    },
    timestamp: new Date(new Date().getTime() - 1 * 3600000).toISOString(),
    unreadCount: 0,
  },
  {
    id: 4,
    name: "Design Team",
    avatar: "https://randomuser.me/api/portraits/men/4.jpg",
    isGroup: true,
    memberCount: 12,
    isOnline: false,
    lastMessage: {
      text: "I've uploaded the new wireframes to the shared folder",
      sender: "Michael Chen",
      status: "sent",
    },
    timestamp: new Date(new Date().getTime() - 1 * 86400000).toISOString(),
    unreadCount: 0,
  },
  {
    id: 5,
    name: "Alex Brown",
    avatar: "https://randomuser.me/api/portraits/men/5.jpg",
    isGroup: false,
    isOnline: false,
    lastSeen: "yesterday",
    isArchived: true,
    lastMessage: {
      text: "Let me know when you're available for a call",
      sender: "Alex Brown",
      status: "read",
    },
    timestamp: new Date(new Date().getTime() - 2 * 86400000).toISOString(),
    unreadCount: 0,
  },
  {
    id: 6,
    name: "Project Atlas",
    avatar: "https://randomuser.me/api/portraits/women/6.jpg",
    isGroup: true,
    memberCount: 15,
    isOnline: true,
    lastMessage: {
      text: "The client approved our proposal!",
      sender: "Jessica Lee",
      status: "delivered",
    },
    timestamp: new Date(new Date().getTime() - 3 * 86400000).toISOString(),
    unreadCount: 5,
  },
  {
    id: 7,
    name: "Sophie Taylor",
    avatar: "https://randomuser.me/api/portraits/women/7.jpg",
    isGroup: false,
    isOnline: true,
    lastSeen: "online",
    lastMessage: {
      text: "Can we reschedule our meeting?",
      sender: "Sophie Taylor",
      status: "delivered",
    },
    timestamp: new Date(new Date().getTime() - 4 * 86400000).toISOString(),
    unreadCount: 0,
  },
  {
    id: 8,
    name: "Tech Support",
    avatar: "https://randomuser.me/api/portraits/men/8.jpg",
    isGroup: true,
    memberCount: 6,
    isOnline: false,
    lastMessage: {
      text: "Server issues have been resolved",
      sender: "David Wilson",
      status: "sent",
    },
    timestamp: new Date(new Date().getTime() - 5 * 86400000).toISOString(),
    unreadCount: 0,
  },
  {
    id: 9,
    name: "Olivia Garcia",
    avatar: "https://randomuser.me/api/portraits/women/9.jpg",
    isGroup: false,
    isOnline: false,
    lastSeen: "3 days ago",
    isArchived: true,
    lastMessage: {
      text: "Thanks for your help!",
      sender: "Olivia Garcia",
      status: "read",
    },
    timestamp: new Date(new Date().getTime() - 6 * 86400000).toISOString(),
    unreadCount: 0,
  },
  {
    id: 10,
    name: "Executive Team",
    avatar: "https://randomuser.me/api/portraits/men/10.jpg",
    isGroup: true,
    memberCount: 5,
    isOnline: true,
    lastMessage: {
      text: "Quarterly report is due next week",
      sender: "Robert Johnson",
      status: "delivered",
    },
    timestamp: new Date(new Date().getTime() - 7 * 86400000).toISOString(),
    unreadCount: 2,
  }
];

export const archivedChats = dummyChats.filter(chat => chat.isArchived);
export const activeChats = dummyChats.filter(chat => !chat.isArchived);