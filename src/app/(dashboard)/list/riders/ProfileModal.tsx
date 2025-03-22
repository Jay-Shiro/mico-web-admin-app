import {motion} from "framer-motion"
import Image from "next/image"
import { useState } from "react"
import { Rider } from "./riderType";
import { exportToCSV } from "@/lib/exportCSV";

  interface ProfileModalProps {
    rider: Rider;
    onClose: () => void;
    onStatusToggle: (id: number, updatedStatus: string) => void;
  }

  
  const formatDateJoined = (isoString: string): string => {
        const date = new Date(isoString);

        const day = date.getDate().toString().padStart(2, "0");
        const month = date.toLocaleString("en-US", { month: "short" });
        const year = date.getFullYear();
        const time = date.toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true 
        });

        return `${day} ${month} ${year} at ${time.toLowerCase()}`;
  }

export const ProfileModal: React.FC<ProfileModalProps> = ({ rider, onClose, onStatusToggle }) => {

    // tracking the status change
    const [isActive, setIsActive] = useState(rider ? rider.status === "active" : false);

    // selected image
    const [selectedImage, setSelectedImage] = useState<string | null>(null);


    if (!rider) return null


    const toggleStatus = () => {
        const updatedStatus = isActive ? "inactive" : "active"
        setIsActive(!isActive);
        onStatusToggle(rider.id, updatedStatus);
    }

    
    return (
        <motion.div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-md p-4"
        initial={{opacity: 0}}
        animate={{ opacity: 1 }}
        exit={{opacity: 0}}>
    
          <motion.div className={`bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-lg max-h-[90vh] sm:w-[400px] transition-all duration-300 overflow-y-auto ${isActive ? "opacity-100" : "opacity-40"}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale:1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0}}>
                
                {/* CLOSE BUTTON */}
                <button className="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-xl" onClick={onClose}>
                    X
                </button>

                {/* STATUS TOGGLE */}
                <div className="mt-4 flex items-center justify-between">
                <p className="text-gray-700 font-medium">Status</p>
                <div className={`w-12 h-6 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer transition-all ${isActive ? "bg-color2" : "bg-red-400" }`} onClick={toggleStatus}>
                <motion.div className="w-5 h-5 bg-white rounded-full shadow-md" animate={{ x: isActive ? 24 : 0}} transition={{ duration: 0.2 }} />
                </div>    
                </div>  


            {/* FADE PROFILE WHEN INACTIVE */}
                <motion.div className="mt-4 transition-opacity duration-300" 
                animate={{ opacity: isActive ? 1 : 0.1 }}>
                 {/* PROFILE IMAGE */}
                <div className="mt-12 justify-center flex">
                    <Image src={rider.facial_photo_url} alt={`${rider.firstname} ${rider.lastname}`} width={100} height={100} className="rounded-full object-cover border-2 border-gray-300" />
                </div>

                {/* PROFILE INFO */}
                <div className="text-center mt-4">
                    <h2 className="text-lg font-semibold">{rider.firstname} {rider.lastname}</h2>
                    <p className="text-gray-500"> <strong>Gender:</strong> {rider.gender}</p>
                    <p className="text-gray-500"><strong>Email:</strong> {rider.email}</p>
                    <p className="text-gray-500"><strong>Phone:</strong> {rider.phone}</p>
                    <p className="text-gray-500"><strong>Date Joined:</strong> {formatDateJoined(rider.date_joined)}</p>
                    <p className="text-gray-500"><strong>Vehicle Type:</strong> {rider.vehicle_type}</p>
                    <p className="text-gray-500"><strong>Address:</strong> {rider.homeaddressdetails}</p>
                    <p className="text-gray-500"><strong>Bvn:</strong> {rider.bvn}</p>
                    <p className="text-gray-500"> <strong>Nin:</strong> {rider.nin}</p>
                </div>

                {/* RATINGS */}
                <div className="mt-4">
                    <p className="text-gray-600 font-medium">Ratings</p>
                    <div className="flex items-center space-x-1">
                        {Array(5)
                        .fill(0)
                        .map((_, index) => (
                            <span key={index} className={`text-color2/40 ${index < rider.ratings ? "opacity-100" : "opacity-20"}`}>
                                ★
                            </span>
                        ))}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div className="bg-color2/40 h-2 rounded-full" style={{ width: `${(rider.ratings / 5) * 100}%`}}></div>
                    </div>
                </div>

                {/* ACCOUNT DETAILS */}
                <div className="mt-6 bg-gray-100 p-4 rounded-lg">
                    <h3 className="text-gray-700 font-semibold mb-2">Account Details</h3>
                    <p className="text-gray-600">
                        <strong>Bank:</strong> {rider.accountbank}
                    </p>
                    <p className="text-gray-600">
                        <strong>Account Name:</strong> {rider.accountname}
                    </p>
                    <p className="text-gray-600">
                        <strong>Acount Number:</strong> {rider.accountnumber}
                    </p>
                    <p className="text-gray-600">
                        <strong>Earnings:</strong> {rider.earnings.toLocaleString()}
                    </p>
                </div> 

    <div className="mt-6">
        <h3 className="text-gray-700 font-semibold mb-2">Documents</h3>
        <div className="grid grid-cols-2 gap-4">
            {[
            { label: "National ID", url: rider.file_ids.nationalid },
            { label: "Utility Bill", url: rider.file_ids.utility_bill },
            { label: "Driver's License", url: rider.file_ids.riders_license || rider.file_ids.drivers_license },
            { 
                label: "Vehicle Papers", 
                url: rider.file_ids.bike_papers || rider.file_ids.lorry_papers || rider.file_ids.vehicle_papers 
            }
            ]
            .filter(doc => doc.url) 
            .map((doc, index) => (
                <div key={index} className="relative cursor-pointer" onClick={() => setSelectedImage(doc.url ?? null)}>
                <Image src={doc.url ?? "/placeholder.jpeg"} alt={doc.label} width={100} height={80} className="rounded-md object-cover border border-gray-300"/>
                <p className="text-xs text-gray-500 text-center mt-1">{doc.label}</p>
                </div>
            ))}
        </div>
</div>


                {/* LIGHTBOX (click to enlarge function) */}
                {selectedImage && (
                    <motion.div 
                    className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md"
                    initial={{ opacity: 0  }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedImage(null)}>
                        <div className="relative">
                            <button className="absolute top-2 right-2 text-white text-xl" onClick={() => setSelectedImage(null)}>X</button>
                            <Image src={selectedImage} alt="Enlarged Document" width={400} height={400} className="rounded-md max-w-full max-h-[80vh] object-contain" />
                        </div>
                    </motion.div>
                )}

                </motion.div>
                {/* CLOSE  BUTTON */}
                <div className="mt-6 flex justify-between">
                    {/* EXPORT BUTTON */}
                    <button className="bg-color2/80 text-white px-4 py-2 rounded-md hover:bg-color2/50" onClick={() => exportToCSV(rider)}>Export CSV</button>
                    
                    {/* CLOSE BUTTON */}
                    <button className="bg-color1/40 text-white px-4 py-2 rounded-md hover:bg-color1/50" onClick={onClose}>Close</button>
                </div>
            </motion.div>

        </motion.div>
    )
}
