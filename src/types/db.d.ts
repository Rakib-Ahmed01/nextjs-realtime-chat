interface User {
  id: string;
  name: string;
  email: string;
  image: string;
}

interface Chat {
  id: string;
  messages: Message[];
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  recieverId: string;
  timestamp: number;
}
