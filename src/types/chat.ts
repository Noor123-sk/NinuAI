export type Message = {
  role: "user" | "ai";
  text: string;
  image?: {
    name: string;
    type: string;
    dataUrl: string;
  };
};

export type Chat = {
  id: string;
  title: string;
  messages: Message[];
};
