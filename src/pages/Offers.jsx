import React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
   collection,
   getDocs,
   query,
   where,
   orderBy,
   limit,
   startAfter,
} from "firebase/firestore";
import Spinner from "../components/Spinner";
import ListingItem from "../components/ListingItem";
import { db } from "../firebase.config";
import { toast } from "react-toastify";

const Offers = () => {
   const [listings, setListings] = useState([]);
   const [loading, setLoading] = useState(true);
   const [lastFetchedListing, setLastFetchedListing] = useState(null);

   useEffect(() => {
      const fetchListings = async () => {
         try {
            // get reference
            const listingsRef = collection(db, "listings");

            // create a query
            const q = query(
               listingsRef,
               where("offer", "==", true),
               orderBy("timestamp", "desc"),
               limit(4)
            );

            // execute Query
            const querySnap = await getDocs(q);
            // console.log(querySnap);

            const lastVisible = querySnap.docs[querySnap.docs.length - 1];
            setLastFetchedListing(lastVisible);

            let listings = [];

            querySnap.forEach((doc) => {
               // console.log(doc.data());
               return listings.push({
                  id: doc.id,
                  data: doc.data(),
               });
            });

            // console.log(listings);
            setListings(listings);

            setLoading(false);

            // console.log(listings)
         } catch (error) {
            toast.error("UseEffect => could not fetching listings");
         }
      };
      fetchListings();
      // console.log("listing aayi =>");
   }, []);

   // console.log("from offers => ", listings);

   // pagination / load more
   const onFetchMoreListings = async () => {
      try {
         // get reference
         const listingsRef = collection(db, "listings");

         // create a query
         const q = query(
            listingsRef,
            where("offer", "==", true),
            orderBy("timestamp", "desc"),
            startAfter(lastFetchedListing),
            limit(2)
         );

         // execute Query
         const querySnap = await getDocs(q);
         // console.log(querySnap);

         const lastVisible = querySnap.docs[querySnap.docs.length - 1];
         setLastFetchedListing(lastVisible);

         let listings = [];

         querySnap.forEach((doc) => {
            // console.log(doc.data());
            return listings.push({
               id: doc.id,
               data: doc.data(),
            });
         });
         // console.log(listings);
         setListings((prevState) => [...prevState, ...listings]);
         setLoading(false);

         // console.log(listings[0].data)
      } catch (error) {
         toast.error("could not fetching listings");
      }
   };

   return (
      <div className="category">
         <header>
            <p className="pageHeader">Offers</p>
         </header>
         {loading ? (
            <Spinner />
         ) : listings && listings.length > 0 ? (
            <>
               <main>
                  <ul className="categoryListings">
                     {listings.map((listing) => (
                        <ListingItem
                           listing={listing.data}
                           id={listing.id}
                           key={listing.id}
                        />
                     ))}
                  </ul>
               </main>

               <br />
               <br />

               {lastFetchedListing && (
                  <p className="loadMore" onClick={onFetchMoreListings}>
                     Load More
                  </p>
               )}
            </>
         ) : (
            <p>There are no current offers </p>
         )}
      </div>
   );
   
};

export default Offers;
