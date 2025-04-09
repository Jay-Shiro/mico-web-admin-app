import { Rider } from "@/app/(dashboard)/list/riders/riderType";
import { DeliveryType } from "@/app/(dashboard)/list/tracking/deliveryType";
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

export const exportDeliveryToCSV = (delivery: DeliveryType) => {
  const csvData = [
    [
      `Delivery ID ${
        delivery._id
      } Details downloaded on ${new Date().toLocaleDateString()}`,
    ],
    ["Field", "Value"],
    ["ID", delivery._id],
    ["User ID", delivery.user_id],
    ["Price", delivery.price],
    ["Distance", delivery.distance],
    ["Startpoint", delivery.startpoint],
    ["Endpoint", delivery.endpoint],
    ["Vehicle Type", delivery.vehicletype],
    ["Transaction Type", delivery.transactiontype],
    ["Package Size", delivery.packagesize || "N/A"],
    ["Delivery Speed", delivery.deliveryspeed],
    ["Status - Delivery", delivery.status.deliverystatus],
    ["Status - Order", delivery.status.orderstatus],
    ["Rider ID", delivery.status.riderid || "N/A"],
    ["Payment Status", delivery.status.transactioninfo.status],
    ["Payment Method", delivery.status.transactioninfo.payment_method || "N/A"],
    ["Payment ID", delivery.status.transactioninfo.payment_id || "N/A"],
    ["Payment Date", delivery.status.transactioninfo.payment_date || "N/A"],
    ["Last Updated", delivery.last_updated || "N/A"],
  ];

  const csvContent =
    "data:text/csv;charset=utf-8," + csvData.map((e) => e.join(",")).join("\n");

  const encodeUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodeUri);
  link.setAttribute("download", `delivery_${delivery._id}.csv`);
  document.body.appendChild(link);

  link.click();
  document.body.removeChild(link);
};

export const exportAllDeliveriesToCSV = (deliveries: DeliveryType[]) => {
  if (!deliveries || deliveries.length === 0) {
    alert("No deliveries available to export");
    return;
  }

  const headers = [
    "ID",
    "User ID",
    "Price",
    "Distance",
    "Startpoint",
    "Endpoint",
    "Vehicle Type",
    "Transaction Type",
    "Package Size",
    "Delivery Speed",
    "Delivery Status",
    "Order Status",
    "Rider ID",
    "Payment Status",
    "Payment Method",
    "Last Updated",
  ];

  const csvData = deliveries.map((delivery) => [
    delivery._id,
    delivery.user_id,
    delivery.price,
    delivery.distance,
    delivery.startpoint,
    delivery.endpoint,
    delivery.vehicletype,
    delivery.transactiontype,
    delivery.packagesize || "N/A",
    delivery.deliveryspeed,
    delivery.status.deliverystatus,
    delivery.status.orderstatus,
    delivery.status.riderid || "N/A",
    delivery.status.transactioninfo.status,
    delivery.status.transactioninfo.payment_method || "N/A",
    delivery.last_updated || "N/A",
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

  link.click();
  document.body.removeChild(link);
};

// ####################################### TRANSACTIONS EXPORT ################################################################

export const exportTransactionToCSV = (transaction: DeliveryType) => {
  const csvData = [
    [`Transaction Details downloaded on ${new Date().toLocaleDateString()}`],
    ["Field", "Value"],
    ["ID", transaction._id],
    [
      "Date",
      new Date(
        transaction.transaction_info?.payment_date || ""
      ).toLocaleString(),
    ],
    ["Amount", `₦${transaction.price.toFixed(2)}`],
    ["Payment Type", transaction.transactiontype],
    ["Delivery Status", transaction.status.deliverystatus],
    ["Order Status", transaction.status.orderstatus],
    [
      "Rider",
      transaction.rider
        ? `${transaction.rider.firstname} ${transaction.rider.lastname}`
        : "Unassigned",
    ],
    ["Customer", transaction.user_id],
    ["Start Point", transaction.startpoint],
    ["End Point", transaction.endpoint],
    ["Vehicle Type", transaction.vehicletype],
    ["Package Size", transaction.packagesize || "N/A"],
    ["Delivery Speed", transaction.deliveryspeed],
    ["Last Updated", transaction.last_updated || "N/A"],
  ];

  const csvContent = csvData.map((row) => row.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `transaction_${transaction._id}_${Date.now()}.csv`;
  link.click();
};
