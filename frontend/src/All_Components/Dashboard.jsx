import Navigation from "./Navigator"
import { useAuth } from "./screen/AuthContext"
import DashboardAccordions from "./Short_COmponents/Dashboard_Accordian"
import { ProfileSection1 } from "./Short_COmponents/Profiles"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"

const Dashboard = () => {
  const { user } = useAuth();
  const username = user?.username || "user";

  // Same color scheme from first dashboard
  const colors = {
    deepPurple: "#2B1B3F",
    antiqueGold: "#C9A24D",
    softIvory: "#F5F3EB",
    lightGold: "#E8D9B0",
    darkPurple: "#1A1129",
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="lg:hidden">
        <ProfileSection1 />
      </div>
      
      <div className="max-w-7xl mx-auto pb-10 px-4 sm:px-6 lg:px-8">
        <Navigation />
        
        <div className="mt-6">
          {/* Welcome Card - Same design as first dashboard */}
          <Card className="shadow-lg rounded-xl border-0 overflow-hidden mb-6" style={{ backgroundColor: colors.softIvory }}>
            <CardHeader className="pb-4" style={{ 
              backgroundColor: colors.deepPurple,
              background: `linear-gradient(135deg, ${colors.darkPurple} 0%, ${colors.deepPurple} 100%)`
            }}>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl md:text-3xl font-bold text-white">
                    Welcome, <span style={{ color: colors.antiqueGold }}>{username}</span>!
                  </CardTitle>
                  <CardDescription className="text-gray-200 mt-2">
                    Our best Coach Platform for your personal growth and development.
                  </CardDescription>
                </div>
                <div className="hidden lg:block">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: colors.antiqueGold + "20" }}>
                    <span className="text-2xl" style={{ color: colors.antiqueGold }}>👥</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: colors.lightGold }}>
                  <h3 className="font-semibold mb-2" style={{ color: colors.deepPurple }}>Coach Sessions</h3>
                  <p className="text-sm" style={{ color: colors.deepPurple + "CC" }}>Check your latest coaching sessions</p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: colors.lightGold }}>
                  <h3 className="font-semibold mb-2" style={{ color: colors.deepPurple }}>Available Credits</h3>
                  <p className="text-sm" style={{ color: colors.deepPurple + "CC" }}>Manage your coaching credits</p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: colors.lightGold }}>
                  <h3 className="font-semibold mb-2" style={{ color: colors.deepPurple }}>Quick Connect</h3>
                  <p className="text-sm" style={{ color: colors.deepPurple + "CC" }}>Connect with a coach now</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content - Same layout structure */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <DashboardAccordions />
            </div>
            
           
          </div>

          {/* Additional Features Section - Matching design */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="shadow-md rounded-xl border-0 overflow-hidden">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: colors.antiqueGold + "20" }}>
                  <span className="text-2xl" style={{ color: colors.antiqueGold }}>🎯</span>
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: colors.deepPurple }}>Goal Setting</h3>
                <p className="text-sm" style={{ color: colors.deepPurple + "CC" }}>Define and track your objectives</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-md rounded-xl border-0 overflow-hidden">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: colors.antiqueGold + "20" }}>
                  <span className="text-2xl" style={{ color: colors.antiqueGold }}>📊</span>
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: colors.deepPurple }}>Analytics</h3>
                <p className="text-sm" style={{ color: colors.deepPurple + "CC" }}>Track your growth journey</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-md rounded-xl border-0 overflow-hidden">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: colors.antiqueGold + "20" }}>
                  <span className="text-2xl" style={{ color: colors.antiqueGold }}>🤝</span>
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: colors.deepPurple }}>Community</h3>
                <p className="text-sm" style={{ color: colors.deepPurple + "CC" }}>Connect with fellow learners</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-md rounded-xl border-0 overflow-hidden">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: colors.antiqueGold + "20" }}>
                  <span className="text-2xl" style={{ color: colors.antiqueGold }}>📚</span>
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: colors.deepPurple }}>Resources</h3>
                <p className="text-sm" style={{ color: colors.deepPurple + "CC" }}>Access learning materials</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard