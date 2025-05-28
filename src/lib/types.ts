export type Recipient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
};

export type Rider = Recipient & {
  deliveries: number;
  rating: string;
};

export type Customer = Recipient & {
  orders: number;
  lastOrder: string;
};

export type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string;
};

export type EmailContent = {
  subject: string;
  body: string;
  template: string;
};

export type Parameter = {
  key: string;
  description: string;
};
