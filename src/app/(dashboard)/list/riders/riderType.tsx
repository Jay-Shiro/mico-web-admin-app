export type Rider = {
  _id: string;
  firstname: string;
  lastname: string;
  gender: string;
  email: string;
  phone: string;
  facial_photo_url: string;
  homeaddressdetails: string;
  earnings: number;
  nin: string;
  bvn: string;
  vehicle_type: string;
  date_joined: string;
  accountbank: string;
  accountname: string;
  accountnumber: string;
  status: string;
  ratings: number;
  file_ids: {
    nationalid?: string;
    utility_bill?: string;
    vehicle_papers?: string;
    bike_papers?: string;
    lorry_papers?: string;
    riders_license?: string;
    drivers_license?: string;
  };
};
