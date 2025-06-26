/* eslint-disable no-unused-vars */
import { Mail, MessageCircle, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"

import { useNavigate } from "react-router-dom"
import CategoryHeader from "@/Advisors_Components/Header"
import { petPsychicsAdvisors } from "@/Advisors_Components/JsonData"
import { AdvisorCard } from "@/Advisors_Components/Advisor_Card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/All_Components/screen/AuthContext"
import { Dialog, DialogContent } from "@/components/ui/dialog";

import axios from "axios";


export default function Numerology() {
      const [birthChartData, setBirthChartData] = useState({
        name: "",
        gender: "",
        birthDay: "",
        birthMonth: "",
        birthYear: "",
        birthHour: "",
        birthMinute: "",
        birthPlace: "",
        birthSeconds:""
      })
      const { user } = useAuth();
    const [selectedPsychic, setSelectedPsychic] = useState(null);
    const [showAstroForm, setShowAstroForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
      const [loading, setLoading] = useState(true);

    const [popupFormData, setPopupFormData] = useState({
      yourName: "",
      birthDate: "",
      
    });
    
      const [first, setFirst] = useState(false)
         const [data, setData] = useState(petPsychicsAdvisors)
            const [showing, setShowing] = useState(5);
      
            const handleShowMore = ()=>{
              setShowing(prev=>prev+5);
            }
      

    
      const handleBirthChartSubmit = (e) => {
        e.preventDefault()
        console.log("Birth Chart Data:", birthChartData)
      }
      const navigate = useNavigate();
      const handlePuch = ()=>{
        navigate("/numerology-detail")
      }
    
    
        useEffect(() => {
        const {
          name,
          gender,
          birthDay,
          birthMonth,
          birthYear,
          birthHour,
          birthMinute,
          birthPlace,
          birthSeconds
        } = birthChartData;
      
        if (
          name &&
          gender &&
          birthDay &&
          birthMonth &&
          birthYear &&
          birthHour &&
          birthMinute &&
          birthPlace && 
          birthSeconds
        ) {
          setFirst(true);
        } else {
          setFirst(false);
        }
      }, [birthChartData]);
      

       useEffect(() => {
          const fetchVedicAdvisors = async () => {
            try {
              const res = await axios.get(
                `${import.meta.env.VITE_BASE_URL}/api/psychics/type/numerology`
              );
              if (res.data.success) {
                setData(res.data.data);
              }
            } catch (err) {
              console.error("Error fetching Vedic advisors:", err);
            } finally {
              setLoading(false);
            }
          };
      
          fetchVedicAdvisors();
        }, []);
      
  return (
    <>
      <CategoryHeader
        title="Numerolgy"
        description="Our Numerolgy specialists can see and interpret the colors and energies surrounding you, providing insights into your emotional, mental, and spiritual state."
        icon={<Sparkles className="w-64 h-64" />}
        bgColor="bg-[#3291F6]"
      />
     
      

     <div className=" max-w-6xl mx-auto px-2 mb-10">
          <Card className="border-2 border-gray-200 bg-white shadow-lg">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-gray-800">Birth Chart (Rasi Chart)</CardTitle>
                    <p className="text-lg font-semibold text-gray-700 mt-2">Enter Birth Details</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <form onSubmit={handleBirthChartSubmit} className="space-y-2">
                      <div>
                        <Input
                          placeholder="Name"
                          value={birthChartData.name}
                          onChange={(e) => setBirthChartData({ ...birthChartData, name: e.target.value })}
                          className="h-10 bg-white border-gray-300 text-gray-700 placeholder:text-gray-400"
                        />
                      </div>
      
                      <div>
                        <Select
                          value={birthChartData.gender}
                          onValueChange={(value) => setBirthChartData({ ...birthChartData, gender: value })}
                        >
                          <SelectTrigger className="h-12 bg-white border-gray-300 text-gray-700">
                            <SelectValue placeholder="Male" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
      
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="birthDay" >BirthDay</Label>
                          <Input
                          id="birthDay"
                          placeholder="25"
                          value={birthChartData.birthDay}
                          onChange={(e) => setBirthChartData({ ...birthChartData, birthDay: e.target.value })}
                          className="h-10 bg-white border-gray-300 text-gray-700 placeholder:text-gray-400"
                        />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="birthMonth" >BirthMonth</Label>
                          <Input
                          id="birthMonth"
                          placeholder="5"
                          value={birthChartData.birthMonth}
                          onChange={(e) => setBirthChartData({ ...birthChartData, birthMonth: e.target.value })}
                          className="h-10 bg-white border-gray-300 text-gray-700 placeholder:text-gray-400"
                        />
                        </div>
                       <div className="space-y-2">
                          <Label htmlFor="birthYear" >BirthYear</Label>
                           <Input
                           id="birthYear"
                          placeholder="2025"
                          value={birthChartData.birthYear}
                          onChange={(e) => setBirthChartData({ ...birthChartData, birthYear: e.target.value })}
                          className="h-10 bg-white border-gray-300 text-gray-700 placeholder:text-gray-400"
                        />
                       </div>
                      </div>
      
                      <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-2">
                          <Label htmlFor="birthHour" >BirthHour</Label>
                           <Input
                           id="birthHour"
                          placeholder="15"
                          value={birthChartData.birthHour}
                          onChange={(e) => setBirthChartData({ ...birthChartData, birthHour: e.target.value })}
                          className="h-10 bg-white border-gray-300 text-gray-700 placeholder:text-gray-400"
                        />
                       </div>
                            <div className="space-y-2">
                          <Label htmlFor="birthMinute" >BirthMinute</Label>
                          <Input
                          id="birthMinute"
                          placeholder="5"
                          value={birthChartData.birthMinute}
                          onChange={(e) => setBirthChartData({ ...birthChartData, birthMinute: e.target.value })}
                          className="h-10 bg-white border-gray-300 text-gray-700 placeholder:text-gray-400"
                        />
                       </div>
                            <div className="space-y-2">
                          <Label htmlFor="birthSeconds" >BirthSeconds</Label>
                         <Input
                         id="birthSeconds"
                          placeholder="26"
                          className="h-10 bg-white border-gray-300 text-gray-700 placeholder:text-gray-400"
                           onChange={(e) => setBirthChartData({ ...birthChartData, birthSeconds: e.target.value })}
                        />
                       </div>
                        
                      </div>
      
                      <div>
                        <Input
                          placeholder="Birth place"
                          value={birthChartData.birthPlace}
                          onChange={(e) => setBirthChartData({ ...birthChartData, birthPlace: e.target.value })}
                          className="h-10 bg-white border-gray-300 text-gray-700 placeholder:text-gray-400"
                        />
                      </div>
      
                      <div className="pt-4">
                        <Button
                        onClick={handlePuch}
                        disabled={first===false}
                        variant="brand"
                          type="submit"
                          className="w-full h-10 font-semibold text-lg rounded-md transition-colors"
                        >
                          Get Started
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
         {loading ? (
          <p className="text-center mt-6">Loading profiles...</p>
        ) : (
         <div className="grid gap-8 mb-10 w-full">
  {data.slice(0, showing).map((psychic, i) => (
    <div
      key={psychic._id || i}
      className="overflow-hidden w-full rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
    >
      <div className="p-6">
        <div className="flex flex-col gap-6 md:flex-row">
          {/* Image & Info */}
          <div className="flex flex-col items-center lg:w-64">
            <div className="relative rounded-full border-4 border-violet-100 dark:border-violet-900">
              <img 
                src={psychic.image || "/placeholder.svg"}
                alt={psychic.name}
                className="object-cover h-32 w-32 rounded-full"
              />
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-xl font-semibold">{psychic.name}</h3>
              <p className="text-slate-700 dark:text-slate-200">{psychic.type}</p>
              <div className="mt-1 flex items-center justify-center">
                {Array(Math.round(psychic.rating || 0))
                  .fill(0)
                  .map((_, i) => (
                    <svg
                      key={i}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {psychic.reviewCount || 0} reviews
              </p>
              <Badge className="mt-2 bg-emerald-500">
                {psychic.status === "online" ? "Available" : psychic.status}
              </Badge>
            </div>
          </div>

          {/* Details & Review */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap gap-2">
              {(psychic.abilities || psychic.skills || []).map((ability, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
                >
                  {ability}
                </Badge>
              ))}
            </div>

            <p className="text-slate-700 dark:text-slate-300">
              {psychic.bio || psychic.description || "No bio available."}
            </p>

           {psychic.latestReview ? (
  <div className="mt-4">
    <h4 className="font-medium text-slate-900 dark:text-white">Latest Review</h4>
    <div className="mt-2 rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        {/* Username or default */}
        <div className="flex items-center gap-2">
          <img
            src={psychic.latestReview?.userImage || "/default-user.png"}
            alt="User"
            className="w-6 h-6 rounded-full"
          />
          <p className="font-medium">
            {psychic.latestReview?.user || "Anonymous"}
          </p>
        </div>

        {/* Rating stars or fallback */}
        <div className="flex">
          {psychic.latestReview?.rating ? (
            Array(Math.round(psychic.latestReview.rating))
              .fill(0)
              .map((_, i) => (
                <svg
                  key={i}
                  className="h-3 w-3 fill-amber-400 text-amber-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))
          ) : (
            <p className="text-sm text-gray-400 italic">No rating</p>
          )}
        </div>
      </div>

      {/* Review text */}
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        {psychic.latestReview?.text || "No review available."}
      </p>
    </div>
  </div>
) : (
  <div className="mt-4">
    <h4 className="font-medium text-slate-900 dark:text-white">Latest Review</h4>
    <div className="mt-2 rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <img
          src="/default-user.png"
          alt="Anonymous"
          className="w-6 h-6 rounded-full"
        />
        <p className="font-medium">Anonymous</p>
      </div>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 italic">
        No review available.
      </p>
    </div>
  </div>
)}

            <div className="mt-6 flex flex-wrap gap-3">
             <Button
  variant="brand"
  className="rounded-full gap-2"
  onClick={() => {
    if (!user) {
      navigate("/login");
      return;
    }
    setSelectedPsychic(psychic);
    setShowAstroForm(true);
  }}
>
  <MessageCircle className="h-4 w-4" />
  Chat €{psychic.rate?.perMinute?.toFixed(2) || "1.75"}/min
</Button>

              <Button variant="ghost" size="icon">
                <Mail className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ))}

  {showing < data.length && (
    <div className="flex justify-center mt-4">
      <Button onClick={handleShowMore} variant="brand">
        Show More
      </Button>
    </div>
  )}
</div>

        )}
      </div>

  <Dialog open={showAstroForm} onOpenChange={setShowAstroForm}>
<DialogContent className=" max-w-lg rounded-xl bg-white p-6 shadow-xl z-50 max-h-[80vh] overflow-y-auto">
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4 text-center">
        Astrology Reading with {selectedPsychic?.name}
      </h2>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!user || !selectedPsychic) return;

          try {
            setIsSubmitting(true);
            const payload = {
              psychicId: selectedPsychic._id,
              formData: popupFormData,
            };

            const res = await axios.post(
              `${import.meta.env.VITE_BASE_URL}/api/form/submit`,
              payload,
              {
                headers: {
                  Authorization: `Bearer ${user.token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            if (res.data.success) {
              setShowAstroForm(false);
              navigate(`/chat/${selectedPsychic._id}`);
            }
          } catch (err) {
            alert("Please complete the form correctly.");
          } finally {
            setIsSubmitting(false);
          }
        }}
        className="space-y-3"
      >
        <Input
          placeholder="Full Name"
          required
          value={popupFormData.yourName}
          onChange={(e) =>
            setPopupFormData({ ...popupFormData, yourName: e.target.value })
          }
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            type="date"
            required
            value={popupFormData.birthDate}
            onChange={(e) =>
              setPopupFormData({ ...popupFormData, birthDate: e.target.value })
            }
          />
        </div>

        <div className="gap-3">
            <Button
            type="submit"
            className="w-full mt-4"
            variant="brand"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Start Reading"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full mt-4"
            onClick={() => setShowAstroForm(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        
        </div>
      </form>
    </div>
  </DialogContent>
</Dialog>


    </>
  );
}
