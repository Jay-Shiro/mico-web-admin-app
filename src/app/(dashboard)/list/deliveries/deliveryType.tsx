import { Rider } from "../riders/riderType";

export type Delivery = {
  id: string;
  user_id: string;
  price: number;
  distance: string;
  startpoint: string;
  endpoint: string;
  vehicletype: string;
  transactiontype: string;
  packagesize: string;
  deliveryspeed: string;
  status: {
    current: string;
    timestamp: string;
  };
  transaction_info: {
    payment_status: string;
    payment_date: string;
    last_updated: string;
  };
  last_updated: string;
  rider?: Rider; // Make rider optional
};
