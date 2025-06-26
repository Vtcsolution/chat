
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card } from "@/components/ui/card"
import { useAuth } from "../screen/AuthContext";
import { Link } from "react-router-dom";

export default function DashboardAccordions() {
    const { user } = useAuth();

  return (
    <>
      <Card className="shadow-sm rounded-sm border border-gray-200">
        {/* Set defaultValue to "settings" to open the accordion on load */}
        <Accordion type="single" collapsible defaultValue="settings">
          <AccordionItem value="settings" className="border-0">
            <div className="px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-medium text-slate-800">Settings</h2>
              </div>
             
            </div>

            {/* This will now be shown by default */}
            <AccordionContent className="px-6 pb-6 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-slate-200 hover:shadow-md transition-shadow">
      <h3 className="font-medium text-slate-800 mb-1">Personal Information</h3>
      

      {/* User info */}
      {user ? (
        
        <div className="text-sm text-slate-700 space-y-1">
          <div className="flex items-center gap-4 mb-4">
  
  <img
    src={user.image || "/default-avatar.png"} // fallback if no avatar
    alt="User Avatar"
    className="w-12 h-12 rounded-full object-cover border border-gray-300"
  /></div>
          <p><span className="font-medium">Username:</span> {user.username || user.name}</p>
          <p><span className="font-medium">Email:</span> {user.email}</p>
        </div>
      ) : (
        <p className="text-sm text-gray-400">User info not available</p>
      )}

      {/* Edit Button */}
      <button className="mt-4 text-sm text-[#3B5EB7] hover:text-[#2c5ace] font-medium">
       <Link to="/update-profile">Edit</Link> 
      </button>
    </div>
                <div className="bg-white rounded-lg p-4 border border-slate-200 hover:shadow-md transition-shadow">
                  <h3 className="font-medium text-slate-800 mb-1">Notification Settings</h3>
                  <p className="text-sm text-slate-500">Manage your notification preferences</p>
                  <button className="mt-3 text-sm text-[#3B5EB7] hover:text-[#2c5ace] font-medium">Configure</button>
                </div>
                <div className="bg-white rounded-lg p-4 border border-slate-200 hover:shadow-md transition-shadow">
                  <h3 className="font-medium text-slate-800 mb-1">Privacy Settings</h3>
                  <p className="text-sm text-slate-500">Control your privacy options</p>
                  <button className="mt-3 text-sm text-[#3B5EB7] hover:text-[#2c5ace] font-medium">Manage</button>
                </div>
                <div className="bg-white rounded-lg p-4 border border-slate-200 hover:shadow-md transition-shadow">
                  <h3 className="font-medium text-slate-800 mb-1">Payment Methods</h3>
                  <p className="text-sm text-slate-500">Manage your payment information</p>
                  <button className="mt-3 text-sm text-[#3B5EB7] hover:text-[#2c5ace] font-medium">Update</button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>
    </>
  );
}
