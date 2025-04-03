import { Rider } from "@/app/(dashboard)/list/riders/riderType";
import { Delivery } from "@/app/(dashboard)/list/deliveries/deliveryType";
// ####################################### RIDERS EXPORT ################################################################

export const exportToCSV = (rider: Rider) => {
  const csvData = [
    [
      `${rider.firstname} ${
        rider.lastname
      }'s Details downloaded on ${new Date().toLocaleDateString()}`,
    ],
    ["Field", "Value"],
    ["ID", rider._id],
    ["Name", `${rider.firstname} ${rider.lastname}`],
    ["Photo Url", rider.facial_picture_url],
    ["Gender", rider.gender],
    ["Email", rider.email],
    ["Phone", rider.phone],
    ["Vehicle Type", rider.vehicle_type],
    ["Date Joined", rider.date_joined],
    ["Address", rider.homeaddressdetails],
    ["NIN", rider.nin],
    ["BVN", rider.bvn],
    ["Bank", rider.accountbank],
    ["Account Name", rider.accountname],
    ["Account Number", rider.accountnumber],
    ["Earnings", `N${rider.earnings.toLocaleString()}`],
    ["Status", rider.status],
    ["Ratings", rider.ratings],
    ["NationalId url", rider.file_ids.nationalid || "not provided"],
    ["Utility Bill url", rider.file_ids.utility_bill || "not provided"],
    [
      "Papers url",
      rider.file_ids.vehicle_papers ||
        rider.file_ids.bike_papers ||
        rider.file_ids.lorry_papers ||
        "not provided",
    ],
    ["License url", rider.file_ids.riders_license || "not provided"],
  ];

  const csvContent =
    "data:text/csv;charset=utf-8," + csvData.map((e) => e.join(",")).join("\n");

  const encodeUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodeUri);
  link.setAttribute(
    "download",
    `rider_${rider._id}_${rider.firstname} ${rider.lastname}.csv`
  );
  document.body.appendChild(link);

  // download button trigger
  link.click();
  document.body.removeChild(link);
};

export const exportAllRidersToCSV = (riders: Rider[]) => {
  if (!riders || riders.length === 0) {
    alert("No riders available to export");
  }

  const headers = [
    "S/N",
    "ID",
    "photo_url",
    "Name",
    "Gender",
    "Email",
    "Phone",
    "Vehicle Type",
    "Address",
    "Bvn",
    "NIN",
    "Date Joined",
    "Bank",
    "Account Name",
    "Account Number",
    "Earnings",
    "Status",
    "Ratings",
    "National ID url",
    "Utility Bill url",
    "Vehicle Papers URL",
    "Riders License",
  ];

  const csvData = riders.map((rider, index) => [
    index + 1,
    rider._id,
    rider.facial_picture_url,
    `${rider.firstname} ${rider.lastname}`,
    rider.gender,
    rider.email,
    rider.phone,
    rider.vehicle_type,
    rider.homeaddressdetails,
    rider.bvn || "not provided",
    rider.nin || "not provided",
    rider.date_joined,
    rider.accountbank,
    rider.accountname,
    rider.accountnumber,
    `N${rider.earnings.toLocaleString()}`,
    rider.status,
    rider.ratings,
    rider.file_ids.nationalid || "not provided",
    rider.file_ids.utility_bill || "not provided",
    rider.file_ids.vehicle_papers ||
      rider.file_ids.bike_papers ||
      rider.file_ids.lorry_papers ||
      "not provided",
    rider.file_ids.riders_license || "not provided",
  ]);

  const csvContent = [
    headers.join(","),
    ...csvData.map((row) => row.map((value) => `"${value}"`).join(",")),
  ].join("\n");

  const csvBlob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(csvBlob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `riders_details_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);

  // download button trigger
  link.click();
  document.body.removeChild(link);
};

// ####################################### DELIVERIES EXPORT ################################################################

export const exportDeliveryToCSV = (delivery: Delivery) => {
  const csvData = [
    [
      `Delivery ID ${
        delivery.id
      } Details downloaded on ${new Date().toLocaleDateString()}`,
    ],
    ["Field", "Value"],
    ["ID", delivery.id],
    ["User Id", delivery.user_id],
    ["Price", delivery.price],
    ["Distance", delivery.distance],
    ["Startpoint", delivery.startpoint],
    ["Endpoint", delivery.endpoint],
    ["Vehicle Type", delivery.vehicletype],
    ["Transaction Type", delivery.transactiontype],
    ["Package Size", delivery.packagesize],
    ["Delivery Speed", delivery.deliveryspeed],
    ["Status", delivery.status.current],
    ["Status Timestamp", delivery.status.timestamp],
    ["Payment Status", delivery.transaction_info.payment_status],
    ["Payment_date", delivery.transaction_info.payment_date],
    ["Payment_last_updated", delivery.transaction_info.last_updated],
    ["Last Updated", delivery.last_updated],
  ];

  const csvContent =
    "data:text/csv;charset=utf-8," + csvData.map((e) => e.join(",")).join("\n");

  const encodeUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodeUri);
  link.setAttribute("download", `delivery_${delivery.id}.csv`);
  document.body.appendChild(link);

  // download button trigger
  link.click();
  document.body.removeChild(link);
};

export const exportAllDeliveriesToCSV = (deliveries: Delivery[]) => {
  if (!deliveries || deliveries.length === 0) {
    alert("No deliveries available to export");
  }

  const headers = [
    "ID",
    "User Id",
    "Price",
    "Distance",
    "Startpoint",
    "Endpoint",
    "Vehicle Type",
    "Transaction Type",
    "Package Size",
    "Delivery Speed",
    "Status",
    "Status Timestamp",
    "Payment Status",
    "Payment_date",
    "Payment_last_updated",
    "Last Updated",
  ];

  const csvData = deliveries.map((delivery) => [
    delivery.id,
    delivery.user_id,
    delivery.price,
    delivery.distance,
    delivery.startpoint,
    delivery.endpoint,
    delivery.vehicletype,
    delivery.transactiontype,
    delivery.packagesize,
    delivery.deliveryspeed,
    delivery.status.current,
    delivery.status.timestamp,
    delivery.transaction_info.payment_status,
    delivery.transaction_info.payment_date,
    delivery.transaction_info.last_updated,
    delivery.last_updated,
  ]);

  const csvContent = [
    headers.join(","),
    ...csvData.map((row) => row.map((value) => `"${value}"`).join(",")),
  ].join("\n");

  const csvBlob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(csvBlob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `deliveries_details_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);

  // download button trigger
  link.click();
  document.body.removeChild(link);
};
