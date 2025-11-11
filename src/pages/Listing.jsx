import React, { useEffect, useState } from "react";
import shareIcon from "../assets/svg/shareIcon.svg?React";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAuth } from "firebase/auth";

import Slider from "../components/Slider";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase.config";
import Spinner from "../components/Spinner";


function Listing() {
   const [listing, setListing] = useState(null);
   const [loading, setLoading] = useState(true);
   const [shareLinkCopied, setShareLinkCopied] = useState(false);
   const navigate = useNavigate();
   const params = useParams();
   const auth = getAuth();

   useEffect(() => {
      const fetchlisting = async () => {
         try {
            const docRef = doc(db, "listings", params.listingId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
               setListing(docSnap.data());
               setLoading(false);
            } else {
               toast.error("Listing not found.");
            }
         } catch (error) {
            console.error(error);
            toast.error("Could not fetch listings.");
         }
      };

      fetchlisting();
   }, [navigate, params.listingId]);

   if (loading) {
      return <Spinner />;
   }

   // console.log("chal rha hai => ", listing);

  

   return (
      <main>
         {/* slider */}
         <Slider imgUrls={listing.imgUrls} />
        

         <div
            className="shareIconDiv"
            onClick={() => {
               navigator.clipboard.writeText(window.location.href);
               setShareLinkCopied(true);
               setTimeout(() => {
                  setShareLinkCopied(false);
               }, 2000);
            }}
         >
            <img src={shareIcon} alt="" />
         </div>

         {setShareLinkCopied && <p className="linkCopied">Link Copied!</p>}

         <div className="listingDetails">
            <p className="listingName">
               {listing.name}
               {" - $"}
               {(listing.offer ? listing.discountedPrice : listing.regularPrice)
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </p>

            <p className="listingLocation">{listing.location}</p>

            <p className="listingType">
               For {listing.type === "rent" ? "Rent" : "Sale"}
            </p>

            {listing.offer && (
               <p className="discountPrice">
                  {"$"}
                  {(listing.regularPrice - listing.discountedPrice)
                     .toString()
                     .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  {" discount"}
               </p>
            )}

            <ul className="listingDetailsList">
               <li>
                  {listing.bedrooms > 1
                     ? `${listing.bedrooms} Bedrooms`
                     : `1 Bedroom`}
               </li>

               <li>
                  {listing.bathrooms > 1
                     ? `${listing.bathrooms} Bedrooms`
                     : `1 Bathroom`}
               </li>

               <li>{listing.parking && "Parking Spot"}</li>
               <li>{listing.furnished && "Furnished"}</li>
            </ul>

            <p className="listingLocationTitle">Location</p>

            {/* map */}
            <div className="leafletContainer">
               <MapContainer
                  style={{ height: "100%", width: "100%" }}
                  center={[listing.geolocation.lat, listing.geolocation.lng]}
                  zoom={13}
                  scrollWheelZoom={true}
               >
                  <TileLayer
                     attribution='© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                     url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker
                     position={[
                        listing.geolocation.lat,
                        listing.geolocation.lng,
                     ]}
                  >
                     <Popup>{listing.location}</Popup>
                  </Marker>
               </MapContainer>
            </div>

            {auth.currentUser?.uid !== listing.userRef && (
               <Link
                  to={`/contact/${listing.userRef}?listingName=${listing.name}`}
                  className="primaryButton"
               >
                  Contact Landlord
               </Link>
            )}
         </div>
      </main>
   );
}

export default Listing;
