import { Rider } from "@/app/(dashboard)/list/riders/riderType";

export const exportToCSV = (rider: Rider) => {
    const csvData = [
        ["Field", "Value"],
        ["ID", rider.id],
        ["Name", `${rider.firstname} ${rider.lastname}`],
        ["Gender", rider.gender],
        ["Email", rider.email],
        ["Phone", rider.phone],
        ["Address", rider.homeaddressdetails],
        ["BVN", rider.bvn],
        ["NIN", rider.nin],
        ["Bank", rider.accountbank],
        ["Account Name", rider.accountname],
        ["Account Number", rider.accountnumber],
        ["Earnings", `N${rider.earnings.toLocaleString()}`],
        ["Status", rider.status],
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