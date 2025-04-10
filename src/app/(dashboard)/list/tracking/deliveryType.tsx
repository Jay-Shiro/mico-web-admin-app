import { Rider } from "../riders/riderType";
import { User } from "@/types/userType";

export interface DeliveryType {
  _id: string;
  user_id: string;
  rider_id: string | null;
  price: number;
  distance: string;
  startpoint: string;
  endpoint: string;
  stops: string[];
  vehicletype: string;
  transactiontype: "cash" | "card";
  packagesize?: string;
  deliveryspeed: "express" | "standard";
  status: {
    deliverystatus: string;
    orderstatus: string;
    riderid: string | null;
    transactioninfo: {
      status: string;
      payment_method: string | null;
      payment_id: string | null;
      payment_date: string | null;
    };
  };
  transaction_info: {
    payment_status: string;
    payment_date: string;
    last_updated: string;
  };
  last_updated?: string;
  rider?: Rider;
  user?: User;
}
