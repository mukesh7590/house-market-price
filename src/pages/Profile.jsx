// IMPORTING THE LIBRARIES
import React, { useEffect, useState } from "react";
import { getAuth, updateProfile } from "firebase/auth";
import { db } from "../firebase.config";
import { useNavigate, Link } from "react-router-dom";
import {
   doc,
   updateDoc,
   collection,
   getDocs,
   query,
   where,
   orderBy,
   deleteDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";
import ArrowRightIcon from "../assets/svg/keyboardArrowRightIcon.svg?React";
import homeIcon from "../assets/svg/homeIcon.svg?React";
import ListingItem from "../components/ListingItem";
import Spinner from "../components/Spinner";

// PROFILE FUNCTION
function Profile() {
   // GETTING THE AUTH USER FROM FIREBASE
   const auth = getAuth();
   // ALL THE USE-STATES HOOKS ARE USING HERE
   const [listings, setListings] = useState([]);
   const [loading, setLoading] = useState(false);
   const [changeDetails, setChangeDetails] = useState(false);
   const [error, setError] = useState(null);

   // FORM DATA STATE
   const [formData, setFormData] = useState({
      name: auth.currentUser.displayName,
      email: auth.currentUser.email,
   });

   // FETCHING THE FORMDATA
   const { name, email } = formData;

   // NAVIGATION HOOK
   const navigate = useNavigate();

   // USE EFFECT HOOK FOR FETCHING
   useEffect(() => {
      const fetchUserListings = async () => {
         try {
            setLoading(true);
            const listingsRef = collection(db, "listings");
            const q = query(
               listingsRef,
               where("userRef", "==", auth.currentUser.uid),
               orderBy("timestamp", "desc")
            );

            const listingsSnap = await getDocs(q);
            const list = [];

            listingsSnap.forEach((doc) =>
               list.push({ id: doc.id, data: doc.data() })
            );

            setListings(list);
         } catch (error) {
            setError(error.message);
         } finally {
            setLoading(false);
         }
      };

      fetchUserListings();
   }, [auth.currentUser.uid]);

   // ✅ Show loading HERE
   if (loading) {
      return <Spinner />;
   }

   // logout function
   const onLogout = () => {
      auth.signOut();
      navigate("/");
   };

   // SUBMIT FUNTION
   const onSubmit = async () => {
      try {
         if (auth.currentUser.displayName !== name) {
            // update display name in firebase
            await updateProfile(auth.currentUser, {
               displayName: name,
            });

            // update in firestore
            const userRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(userRef, {
               name,
            });
         }
      } catch (error) {
         toast.error("could not update profile details");
      }
   };

   // ONCHANGE FUNCTION
   const onChange = (e) => {
      e.preventDefault();
      setFormData((prevState) => ({
         ...prevState,
         [e.target.id]: e.target.value,
      }));
   };

   // ONDELETE FUNCTION
   const onDelete = async (listingId) => {
      if (window.confirm("Are You Sure You Want To Delete ? ")) {
         await deleteDoc(doc(db, "listings", listingId));
         const updatedListings = listings.filter(
            (listing) => listing.id !== listingId
         );

         setListings(updatedListings);
         toast.success("Successfully deleted listing");
      }
   };

   // NAVIGATION ON EDIT LISTING
   const onEdit = async (listingId) => navigate(`/edit-listing/${listingId}`);

   return (
      <div className="profile">
         <header className="profileHeader">
            <p className="pageHeader">My Profile</p>
            <button type="button" className="logOut" onClick={onLogout}>
               LogOut
            </button>
         </header>

         <main>
            <div className="profileDetailsHeader">
               <p className="profileDetailsText">Personal Details</p>
               <p
                  className="changePersonalDetails"
                  onClick={() => {
                     changeDetails && onSubmit();
                     setChangeDetails((prevState) => !prevState);
                  }}
               >
                  {changeDetails ? "done" : "change"}
               </p>
            </div>

            <div className="profileCard">
               <form action="">
                  <input
                     type="text"
                     id="name"
                     className={
                        !changeDetails ? "profileName" : "profileNameActive"
                     }
                     disabled={!changeDetails}
                     value={name}
                     onChange={onChange}
                  />

                  <input
                     type="email"
                     id="email"
                     className={
                        !changeDetails ? "profileEmail" : "profileEmailActive"
                     }
                     disabled={!changeDetails}
                     value={email}
                     onChange={onChange}
                  />
               </form>
            </div>

            <Link to="/create-listing" className="createListing">
               <img src={homeIcon} alt="home" />
               <p>sell or rent your home</p>
               <img src={ArrowRightIcon} alt="arrow right" />
            </Link>

            {!loading && listings?.length > 0 && (
               <>
                  <p className="listingText">Your Listings</p>
                  <ul className="listingsList">
                     {listings.map((listing) => (
                        <ListingItem
                           key={listing.id}
                           listing={listing.data}
                           id={listing.id}
                           onDelete={() => onDelete(listing.id)}
                           onEdit={() => onEdit(listing.id)}
                        />
                     ))}
                  </ul>
               </>
            )}
         </main>
      </div>
   );
}

export default Profile;
