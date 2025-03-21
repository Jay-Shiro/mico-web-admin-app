export type Rider = {
    id: number;
    firstname: string;
    lastname: string;
    gender: string;
    email: string;
    phone: string;
    facial_photo_url: string;
    homeaddressdetails: string;
    earnings: number;
    bvn: number;
    nin: number;
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
  
  