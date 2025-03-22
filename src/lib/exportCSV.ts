import { Rider } from "@/app/(dashboard)/list/riders/riderType";

export const exportToCSV = (rider: Rider) => {
    const csvData = [
        [`${rider.firstname} ${rider.lastname}'s Details downloaded on ${new Date().toLocaleDateString()}`],
        ["Field", "Value"],
        ["ID", rider.id],
        ["Name", `${rider.firstname} ${rider.lastname}`],
        ["Photo Url", rider.facial_photo_url],
        ["Gender", rider.gender],
        ["Email", rider.email],
        ["Phone", rider.phone],
        ["Vehicle Type", rider.vehicle_type], 
        ["Date Joined", rider.date_joined],
        ["Address", rider.homeaddressdetails],
        ["BVN", rider.bvn],
        ["NIN", rider.nin],
        ["Bank", rider.accountbank],
        ["Account Name", rider.accountname],
        ["Account Number", rider.accountnumber],
        ["Earnings", `N${rider.earnings.toLocaleString()}`],
        ["Status", rider.status],
        ["Ratings", rider.ratings],
        ["NationalId url", rider.file_ids.nationalid || "not provided"],
        ["Utility Bill url", rider.file_ids.utility_bill || "not provided"],
        ["Papers url", rider.file_ids.vehicle_papers || rider.file_ids.bike_papers || rider.file_ids.lorry_papers || "not provided"],
        ["License url", rider.file_ids.riders_license || "not provided"]
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvData.map(e => e.join(",")).join("\n");
    
    const encodeUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodeUri);
    link.setAttribute("download", `rider_${rider.id}_${rider.firstname} ${rider.lastname}.csv`);
    document.body.appendChild(link);

    // download button trigger
    link.click();
    document.body.removeChild(link)
};

export const exportAllRidersToCSV = (riders: Rider[]) => {
    if (!riders || riders.length === 0) {
        alert("No riders available to export");
    }

    const headers = ["ID", "photo_url", "Name", "Gender", "Email", "Phone","Vehicle Type", "Address", "BVN", "NIN", "Date Joined", "Bank", "Account Name", "Account Number", "Earnings", "Status", "Ratings", "National ID url", "Utility Bill url", "Vehicle Papers URL", "Riders License"];

    const csvData = riders.map(rider => [
        rider.id,
        rider.facial_photo_url,
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
        rider.file_ids.vehicle_papers || rider.file_ids.bike_papers || rider.file_ids.lorry_papers || "not provided",
        rider.file_ids.riders_license || "not provided"
    ]);

    const csvContent = [
        headers.join(","),
        ...csvData.map(row => row.map(value => `"${value}"`).join(",")) 
    ].join("\n");


    const csvBlob = new Blob([csvContent], {type: "text/csv;charset=utf-8;"});
    const url = URL.createObjectURL(csvBlob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `riders_details_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);

    // download button trigger
    link.click();
    document.body.removeChild(link)
};