import React, { useState, useEffect, useRef } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
   getStorage,
   ref,
   uploadBytes,
   getDownloadURL,
   uploadBytesResumable,
} from "firebase/storage";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { resolvePath, useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import { db } from "../firebase.config";
import { v4 as uuidv4 } from "uuid";

function CreateListing() {
   // eslint-disable-next-line no-unused-vars
   const [geolocationEnabled, setGeolocatedEnabled] = useState(false);
   const [loading, setLoading] = useState(false);

   const [formData, setFormData] = useState({
      type: "rent",
      name: "",
      bedrooms: 1,
      bathrooms: 1,
      parking: false,
      furnished: false,
      location: "",
      offer: false,
      regularPrice: 0,
      discountedPrice: 0,
      images: [],
      latitude: 0,
      longitude: 0,
   });

   const {
      type,
      name,
      bedrooms,
      bathrooms,
      parking,
      furnished,
      location,
      offer,
      regularPrice,
      discountedPrice,
      images,
      latitude,
      longitude,
   } = formData;

   const auth = getAuth();
   const navigate = useNavigate();
   const isMounted = useRef(true);

   useEffect(() => {
      if (isMounted) {
         onAuthStateChanged(auth, (user) => {
            if (user) {
               setFormData({ ...formData, userRef: user.uid });
            } else {
               navigate("/sign-in");
            }
         });
      }

      return () => {
         isMounted.current = false;
      };
   }, [isMounted]);

   if (loading) {
      return <Spinner />;
   }

   const onSubmit = async (e) => {
      e.preventDefault();
      console.log(formData);
      setLoading(true);

      if (+discountedPrice >= +regularPrice) {
         setLoading(false);
         toast.error("Discounted price needs to be less than regular price");
         return;
      }

      if (images.length > 6) {
         setLoading(false);
         toast.error("max 6 images");
         return;
      }

      let geolocation = {};
      let locationAddress = {};

      if (geolocationEnabled) {
         const response =
            await fetch(`"https://www.google.com/maps/embed/v1/place?key=AIzaSyBdIIv8RhhHRS4JyWwrUmJsjtdrajkDcDE
    &q=Space+Needle,Seattle+WA"`);
    
         const data = await reponse.json();

         console.log(data);
         geolocation.lat = data.result[0]?.geometry.locationAddress.lat ?? 0;
         geolocation.lng = data.result[0]?.geometry.locationAddress.lng ?? 0;

         locationAddress =
            data.status === "ZERO_RESULTS"
               ? undefined
               : data.results[0]?.formatted_address;

         if (locationAddress === undefined || locationAddress.includes("undefined")) {
            setLoading(false);
            toast.error("Please enter a correct address");
            return;
         }
      } else {
         geolocation.lat = latitude;
         geolocation.lng = longitude;
         // location = addr;
         // console.log(geolocation, location);
      }

      // store images in firebase
      
      const storeImage = async (image) => {
         return new Promise((resolve, reject) => {
            const storage = getStorage();
            const fileName = `${auth.currentUser.uid}-${
               image.name
            }-${uuidv4()}`;

            const storageRef = ref(storage, "images/" + fileName);
            const uploadTask = uploadBytesResumable(storageRef, image);

            uploadTask.on(
               "state_changed",
               (snapshot) => {
                  const progress =
                     (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                  console.log("Upload is " + progress + "% done");
                  switch (snapshot.state) {
                     case "paused":
                        console.log("Upload is paused");
                        break;
                     case "running":
                        console.log("Upload is running");
                        break;
                     default:
                        console.log(`Upload is ${snapshot.state}`);
                        break;
                  }
               },
               (error) => {
                  reject(error);
               },
               () => {
                  // Handle successful uploads on complete
                  // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                  getDownloadURL(uploadTask.snapshot.ref).then(
                     (downloadURL) => {
                        resolve(downloadURL);
                     }
                  );
               }
            );
         });
      };

      const imgUrls = await Promise.all(
         [...images].map((image) => storeImage(image))
      ).catch(() => {
         setLoading(false);
         toast.error("Image not uploaded");
         return;
      });

      const formDateCopy = {
         ...formData,
         imgUrls,
         geolocation,
         timestamp: serverTimestamp(),
      };

      delete formDateCopy.images;
      // delete formDateCopy.address;
      location && (formDateCopy.location = location);
      !formDateCopy.offer && delete formDateCopy.deiscountedPrice;

      const docRef = await addDoc(collection(db, "listings"), formDateCopy);

      console.log(imgUrls);
      setLoading(false);

      toast.success("Listing saved");
      navigate(`/category/${formDateCopy.type}/${docRef.id}`);
   };

   const onMutate = (e) => {
      let boolean = null;

      if (e.target.value === "true") {
         boolean = true;
      }
      if (e.target.value === "false") {
         boolean = false;
      }

      //   files
      if (e.target.files) {
         console.log("files aayi hai => ", e.target.files);
         setFormData((prevState) => ({
            ...prevState,
            images: e.target.files,
         }));
      }

      // text/booleans/numbers

      if (!e.target.files) {
         setFormData((prevState) => ({
            ...prevState,
            [e.target.id]: boolean ?? e.target.value,
         }));
      }

      console.log(formData);
   };

   return (
      <div className="profile">
         <header>
            <p>Create a Listing</p>
         </header>
         <main>
            <form onSubmit={onSubmit}>
               <label className="formLabel">Sell / Rent</label>

               <div className="formButtons">
                  <button
                     type="button"
                     className={
                        type === "sale" ? "formButtonActive" : "formButton"
                     }
                     id="type"
                     value="sale"
                     onClick={onMutate}
                  >
                     Sell
                  </button>
                  <button
                     type="button"
                     className={
                        type === "rent" ? "formButtonActive" : "formButton"
                     }
                     id="type"
                     value="rent"
                     onClick={onMutate}
                  >
                     Rent
                  </button>
               </div>

               <label className="formLabel">Name</label>
               <input
                  className="formInputName"
                  type="text"
                  id="name"
                  value={name}
                  onChange={onMutate}
                  maxLength="32"
                  minLength="10"
                  required
               />

               <div className="formRooms flex">
                  <div>
                     <label className="formLabel">Bedrooms</label>
                     <input
                        className="formInputSmall"
                        type="number"
                        id="bedrooms"
                        value={bedrooms}
                        onChange={onMutate}
                        min="1"
                        max="50"
                        required
                     />
                  </div>
                  <div>
                     <label className="formLabel">Bathrooms</label>
                     <input
                        className="formInputSmall"
                        type="number"
                        id="bathrooms"
                        value={bathrooms}
                        onChange={onMutate}
                        min="1"
                        max="50"
                        required
                     />
                  </div>
               </div>

               <label className="formLabel">Parking</label>
               <div className="formButtons">
                  <button
                     type="button"
                     className={parking ? "formButtonActive" : "formButton"}
                     id="parking"
                     value={true}
                     onClick={onMutate}
                  >
                     Yes
                  </button>
                  <button
                     type="button"
                     className={!parking ? "formButtonActive" : "formButton"}
                     id="parking"
                     value={false}
                     onClick={onMutate}
                  >
                     No
                  </button>
               </div>

               <label className="formLabel">Furnished</label>
               <div className="formButtons">
                  <button
                     type="button"
                     className={furnished ? "formButtonActive" : "formButton"}
                     id="furnished"
                     value={true}
                     onClick={onMutate}
                  >
                     Yes
                  </button>
                  <button
                     type="button"
                     className={!furnished ? "formButtonActive" : "formButton"}
                     id="furnished"
                     value={false}
                     onClick={onMutate}
                  >
                     No
                  </button>
               </div>

               <label className="formLabel">Address</label>
               <textarea
                  className="formInputAddress"
                  type="text"
                  id="location"
                  value={location}
                  onChange={onMutate}
                  required
               />

               {!geolocationEnabled && (
                  <div className="formLatLng flex">
                     <div>
                        <label className="formLabel">Latitude</label>
                        <input
                           className="formInputSmall"
                           type="number"
                           id="latitude"
                           value={latitude}
                           onChange={onMutate}
                           required
                        />
                     </div>
                     <div>
                        <label className="formLabel">Longitude</label>
                        <input
                           className="formInputSmall"
                           type="number"
                           id="longitude"
                           value={longitude}
                           onChange={onMutate}
                           required
                        />
                     </div>
                  </div>
               )}

               <label className="formLabel">Offer</label>
               <div className="formButtons">
                  <button
                     type="button"
                     className={offer ? "formButtonActive" : "formButton"}
                     id="offer"
                     value={true}
                     onClick={onMutate}
                  >
                     Yes
                  </button>
                  <button
                     type="button"
                     className={!offer ? "formButtonActive" : "formButton"}
                     id="offer"
                     value={false}
                     onClick={onMutate}
                  >
                     No
                  </button>
               </div>

               <label className="formLabel">Regular Price</label>
               <div className="formPriceDiv">
                  <input
                     className="formInputSmall"
                     type="number"
                     id="regularPrice"
                     value={regularPrice}
                     onChange={onMutate}
                     min="50"
                     max="750000000"
                     required
                  />
                  {type === "rent" && (
                     <p className="formPriceText">$ / Month</p>
                  )}
               </div>

               {offer && (
                  <>
                     <label className="formLabel">Discounted Price</label>
                     <div className="formPriceDiv">
                        <input
                           className="formInputSmall"
                           type="number"
                           id="discountedPrice"
                           value={discountedPrice}
                           onChange={onMutate}
                           min="50"
                           max="750000000"
                           required={offer}
                        />
                        {type === "rent" && (
                           <p className="formPriceText">$ / Month</p>
                        )}
                     </div>
                  </>
               )}

               <label className="formLabel">Images</label>
               <p className="imagesInfo">
                  The first image will be the cover (max 6).
               </p>
               <input
                  className="formInputFile"
                  type="file"
                  id="images"
                  onChange={onMutate}
                  max="6"
                  accept=".jpg,.png,.jpeg"
                  multiple
                  required
               />

               <button
                  type="submit"
                  className="primaryButton createListingButton"
               >
                  Create Listing
               </button>
            </form>
         </main>
      </div>
   );
}

export default CreateListing;
