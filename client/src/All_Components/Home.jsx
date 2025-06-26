/* eslint-disable no-unused-vars */
import { Search, MessageCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "./screen/AuthContext";
import axios from "axios";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ProfileSection, ProfileSection1 } from "./Short_COmponents/Profiles";
const Home = () => {
const { user } = useAuth();
const navigate = useNavigate();
const [psychics, setPsychics] = useState([]);
const [showing, setShowing] = useState(4);
const max = psychics.length;
const [showFormModal, setShowFormModal] = useState(false);
const [selectedPsychic, setSelectedPsychic] = useState(null);
  const [isGeocoding, setIsGeocoding] = useState(false); // Add this line


const [formData, setFormData] = useState({
yourName: "",
yourBirthDate: "",
yourBirthTime: "",
yourBirthPlace: "",
partnerName: "",
partnerBirthDate: "",
partnerBirthTime: "",
partnerPlaceOfBirth: "",
fullName: "",  
birthDate: "",
latitude: "",    
longitude: "" 
});

 const geocodeBirthPlace = async () => {
    if (!formData.birthPlace) return;
    
    setIsGeocoding(true);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(formData.birthPlace)}&format=json`,
        {
          headers: {
            'User-Agent': 'YourAppName/1.0 (your@email.com)' // Required by Nominatim
          }
        }
      );
      
      if (response.data.length > 0) {
        setFormData(prev => ({
          ...prev,
          latitude: parseFloat(response.data[0].lat).toFixed(6),
          longitude: parseFloat(response.data[0].lon).toFixed(6)
        }));
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
    } finally {
      setIsGeocoding(false);
    }
  };

  // --- ADD THE USEEFFECT HOOK HERE ---
  useEffect(() => {
    if (selectedPsychic?.type === "Astrology" && formData.birthPlace) {
      const debouncedGeocode = setTimeout(() => {
        geocodeBirthPlace();
      }, 1000);
      
      return () => clearTimeout(debouncedGeocode);
    }
  }, [formData.birthPlace, selectedPsychic?.type]);

const [isSubmitting, setIsSubmitting] = useState(false);

// Fetch psychics from API
useEffect(() => {
  const fetchPsychics = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/psychics`);
      setPsychics(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch psychics", err);
      setPsychics([]);
    }
  };
  fetchPsychics();
}, []);

const handleShowMore = () => setShowing(prev => Math.min(prev + 4, max));

// Handle psychic selection
const handlePsychicSelect = (psychic) => {
if (!user) {
  navigate('/login');
  return;
}
  setSelectedPsychic(psychic);
  
  // Directly navigate for tarot, show form for others
  if (psychic.type.toLowerCase() === "tarot") {
  navigate(`/chat/${psychic._id}`);
} else {
  setSelectedPsychic(psychic);
  setFormData({
    yourName: "",
    yourBirthDate: "",
    yourBirthTime: "",
    yourBirthPlace: "",
    partnerName: "",
    partnerBirthDate: "",
    partnerBirthTime: "",
    partnerPlaceOfBirth: "",
    fullName: "",
    birthDate: "",
    latitude:"",
    longitude:""
  });
  setShowFormModal(true);
}
};

// Handle form input changes
const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
};

// Submit form data
const handleFormSubmit = async () => {
if (!selectedPsychic || !user) return;
  if (selectedPsychic.type === "Astrology") {
    if (!formData.birthTime.match(/^([01]?\d|2[0-3]):([0-5]?\d)(?::([0-5]?\d))?$/)) {
    alert("Please enter time in HH:MM or HH:MM:SS format (24-hour)");
    return;
  }
    
    if (isNaN(formData.latitude) || isNaN(formData.longitude)) {
      alert("Please enter valid coordinates");
      return;
    }
  }
setIsSubmitting(true);

try {
  const payload = {
    psychicId: selectedPsychic._id,
    formData: formData
  };

  const response = await axios.post(
    `${import.meta.env.VITE_BASE_URL}/api/form/submit`,
    payload,
    {
      headers: { 
        Authorization: `Bearer ${user.token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (response.data.success) {
    navigate(`/chat/${selectedPsychic._id}`);
  }
} catch (error) {
  if (error.response) {
    if (error.response.data.error?.code === 'MISSING_FIELDS') {
      const missingFields = error.response.data.error.fields || [];
      alert(`Please fill in: ${missingFields.join(', ')}`);
    } else {
      alert(error.response.data.message || "Submission failed");
    }
  } else {
    alert("Network error. Please check your connection.");
  }
} finally {
  setIsSubmitting(false);
}
};
console.log("Token being sent:", user?.token);
console.log("Selected psychic:", selectedPsychic);
console.log("Psychic type:", selectedPsychic?.type);

// Render fields based on psychic category
const renderFormFields = () => {
if (!selectedPsychic) return null;

const type = selectedPsychic.type.toLowerCase();

const commonInput = (label, name, type = "text", placeholder = "", required = false) => (
  <div className="space-y-2">
    <Label>{label}{required ? " *" : ""}</Label>
    <Input
      type={type}
      name={name}
      value={formData[name] || ""}
      onChange={handleInputChange}
      placeholder={placeholder}
      required={required}
    />
  </div>
);

switch (type) {
 case "astrology":
  return (
    <>
      {commonInput("Full Name", "yourName", "text", "John Doe", true)}
      <div className="grid grid-cols-2 gap-4">
        {commonInput("Date of Birth", "birthDate", "date", "", true)}
        {commonInput("Time of Birth (HH:MM:SS)", "birthTime", "text", "12:34:56", true)}
      </div>
      {commonInput("Place of Birth", "birthPlace", "text", "City, Country", true)}
      <div className="grid grid-cols-2 gap-4">
        {commonInput("Latitude", "latitude", "number", "31.5497", true)}
        {commonInput("Longitude", "longitude", "number", "74.3436", true)}
      </div>
      {/* Add this status display */}
      {isGeocoding && (
        <p className="text-sm text-gray-500">Looking up coordinates for {formData.birthPlace}...</p>
      )}
      {formData.latitude && formData.longitude && !isGeocoding && (
        <p className="text-sm text-green-600">
          Coordinates found: {formData.latitude}, {formData.longitude}
        </p>
      )}
    </>
  );
  case "numerology":
    return (
      <>
        {commonInput("Full Name", "yourName", "text", "John Doe", true)}
        {commonInput("Date of Birth", "birthDate", "date", "", true)}
      </>
    );

  case "love":
    return (
      <>
        {commonInput("Your Full Name", "yourName", "text", "Your name", true)}
        <div className="grid grid-cols-2 gap-4">
          {commonInput("Your Date of Birth", "yourBirthDate", "date", "", true)}
          {commonInput("Your Time of Birth", "yourBirthTime", "time")}
        </div>
        {commonInput("Your Place of Birth", "yourBirthPlace", "text", "City, Country")}
        
        <div className="border-t pt-4 mt-4">
          <h3 className="font-medium mb-4">Partner Information (Optional)</h3>
          {commonInput("Partner's Full Name", "partnerName", "text", "Partner's name")}
          <div className="grid grid-cols-2 gap-4">
            {commonInput("Partner's Date of Birth", "partnerBirthDate", "date")}
            {commonInput("Partner's Time of Birth", "partnerBirthTime", "time")}
          </div>
          {commonInput("Partner's Place of Birth", "partnerPlaceOfBirth", "text", "City, Country")}
        </div>
      </>
    );

  default:
    return null;
}
};



return (
  <div className="">
    <div className="relative w-full overflow-hidden">
      <img 
        src="/images/banner.jpeg" 
        className="w-full h-[600px] scale-105 max-sm:scale-125 object-cover" 
        alt="banner" 
      />
      <div className="absolute top-1/2 sm:top-[80%] left-1/2 -translate-y-1/2 sm:-translate-y-[80%] -translate-x-1/2">
        <h1 
          style={{fontFamily:"Roboto"}} 
          className="text-4xl max-[500px]:w-[280px] sm:text-5xl lg:text-[52px] leading-[50px] sm:leading-[60px] md:leading-[70px] font-sans font-extrabold uppercase text-white text-center w-full"
        >
          DE NATIONALE HULPLIJN <br />VOOR ELKAAR MET ELKAAR
        </h1>
        <img 
          src="/images/newLogo.jpg" 
          className="md:w-20 md:h-20 w-14 h-14 m-auto rounded-full object-cover" 
          alt="logo" 
        />
      </div>
    </div>
    
    <div className="max-w-7xl px-2 m-auto">
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-2 w-full">
          <div className="overflow-x-auto">
            <ProfileSection1 />
          </div>
          
          <div className="wrapper">
            <Tabs defaultValue="active">
              <div className="flex max-sm:flex-col max-sm:gap-4 w-full mb-2 items-center justify-between">
                <div className="relative w-full mx-4">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <Input
                    type="search"
                    placeholder="Find your advisor..."
                    className="w-full rounded-full border-slate-200 bg-white pl-8 dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>
                <div className="flex max-[450px]:flex-col items-center gap-4">
                  <TabsList className="grid w-full grid-cols-3 min-[450px]:w-[300px] px-2">
                    <TabsTrigger value="active" className="rounded-full">
                      Active <Badge className="ml-1 bg-emerald-500">54</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="chat" className="rounded-full">
                      Chat <Badge className="ml-1">25</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="new" className="rounded-full">
                      New
                    </TabsTrigger>
                  </TabsList>
                  <Button variant="brand" className="rounded-full text-white">
                    Get Started
                  </Button>
                </div>
              </div>
              
        <TabsContent value="active">
          <div className="grid gap-8 mb-10 w-full">
            {psychics.slice(0, showing).map((psychic, i) => (
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
                src={psychic.image}
                alt={psychic.name}

                className="object-cover h-32 w-32 rounded-full"
              />
                              
        </div>
        <div className="mt-4 text-center">
          <h3 className="text-xl font-semibold">{psychic.name}</h3>
          <p className="text-slate-700 dark:text-slate-200">{psychic.type}</p>
          <div className="mt-1 flex items-center justify-center">
            {Array(Math.round(psychic.rating?.avgRating || 0))
              .fill(0)
              .map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {psychic.rating?.ratingCount || 0} reviews
          </p>
          <Badge className="mt-2 bg-emerald-500">Available</Badge>
        </div>
      </div>

                          {/* Details & Review */}
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap gap-2">
            {psychic.abilities?.map((ability, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
              >
                {ability}
              </Badge>
            ))}
          </div>

          <p className="text-slate-700 dark:text-slate-300">{psychic.bio}</p>


              <div className="mt-4">
                <h4 className="font-medium text-slate-900 dark:text-white">Latest Review</h4>
                <div className="mt-2 rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <p className="font-medium">
                  {psychic.latestReview?.user || "Anonymous"}
                </p>
                <div className="flex">
                  {Array(Math.round(psychic.latestReview?.rating || 0))
                    .fill(0)
                    .map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                    ))}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    {psychic.latestReview?.text || "No recent review available."}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button 
                  variant="brand" 
                  className="rounded-full gap-2"
                  onClick={() => handlePsychicSelect(psychic)}
                >
                        <MessageCircle className="h-4 w-4" />
                        Chat €{psychic.rate?.perMinute?.toFixed(2) || "1.75"}/min
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

                  {showing < max && (
                    <Button onClick={handleShowMore} variant="brand">
                      Show More
                    </Button>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="lg:col-span-1 max-lg:hidden">
          <ProfileSection />
        </div>
      </div>
    </div>
<Dialog open={showFormModal} onOpenChange={setShowFormModal}>
  <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-white rounded-xl shadow-lg z-50 focus:outline-none p-0">
    {selectedPsychic && (
      <div className="max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-center mb-6">
            {selectedPsychic.name} Reading
          </h2>

          <p className="text-center text-gray-600 mb-4">
            Please provide your information for a personalized reading
          </p>

          <div className="space-y-4">{renderFormFields()}</div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button
              onClick={() => setShowFormModal(false)}
              variant="outline"
              className="w-full sm:flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleFormSubmit}
              variant="brand"
              className="w-full sm:flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Starting Session..." : "Start Reading"}
            </Button>
          </div>
        </div>
      </div>
    )}
  </DialogContent>
</Dialog>
 
  </div>
);
};

export default Home;