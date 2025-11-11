import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { db } from "../firebase.config";
import Spinner from "../components/Spinner";

const Contact = () => {
   const [message, setMessage] = useState("");
   const [landlord, setLandlord] = useState(null);
   const [searchParams, setSearchParams] = useSearchParams();
   const [loading, setLoading] = useState(true);

   const params = useParams();
   //    console.log(params);

   useEffect(() => {
      const getLandloard = async () => {
         const docRef = doc(db, "users", params.landlordId);
         const docSnap = await getDoc(docRef);

         if (docSnap.exists()) {
            setLandlord(docSnap.data());
         } else {
            toast.error("Could not get landlord data");
         }
         setLoading(false);
      };
      getLandloard();
   }, [params.landlordId]);

   const onChange = (e) => {
      setMessage(e.target.value);
   };

   if (loading) return <Spinner />;

   return (
      <div className="pageContainer">
         <header>
            <p className="pageHeader">Contact Landlord</p>
         </header>

         {landlord !== null && (
            <main>
               <div className="contactLandlord">
                  <p className="landlordName">Contact {landlord?.name}</p>
               </div>

               <form className="messageForm">
                  <div className="messageDiv">
                     <label htmlFor="message" className="messageLabel">
                        Message
                     </label>
                     <textarea
                        name="message"
                        id="message"
                        className="textarea"
                        value={message}
                        onChange={onChange}
                     ></textarea>
                  </div>

                  <a
                     href={`mailto:${landlord.email}?Subject=${searchParams.get(
                        "listingName"
                     )}&bod=${message}`}
                  >
                     <button type="button" className="primaryButton">
                        Send Message
                     </button>
                  </a>
               </form>
            </main>
         )}
      </div>
   );
};

export default Contact;
