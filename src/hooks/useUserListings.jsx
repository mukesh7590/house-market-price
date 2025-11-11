// hooks/useUserListings.js
// import { useState, useEffect } from "react";

// import { db, auth } from "../firebase";

// export const useUserListings = () => {
//    const [listings, setListings] = useState([]);
//    const [loading, setLoading] = useState(true);
//    const [error, setError] = useState(null);

//    useEffect(() => {
//       const fetchUserListings = async () => {
//          try {
//             setLoading(true);
//             setError(null);

//             if (!auth.currentUser) {
//                setError("User not authenticated");
//                setLoading(false);
//                return;
//             }

//             const listingsRef = collection(db, "listings");
//             const q = query(
//                listingsRef,
//                where("userRef", "==", auth.currentUser.uid),
//                orderBy("timestamp", "desc")
//             );

//             const listingsSnap = await getDocs(q);
//             const list = [];

//             listingsSnap.forEach((doc) => {
//                list.push({
//                   id: doc.id,
//                   data: { ...doc.data(), id: doc.id },
//                });
//             });

//             setListings(list);
//          } catch (err) {
//             console.error("Error fetching listings:", err);
//             setError(err.message);
//          } finally {
//             setLoading(false);
//          }
//       };

//       fetchUserListings();
//    }, [auth.currentUser?.uid]); // Only depend on uid

//    return { listings, loading, error, refetch: () => fetchUserListings() };
// };

// YourComponent.jsx
// import { useUserListings } from "../hooks/useUserListings";

// const YourComponent = () => {
//    const { listings, loading, error } = useUserListings();

//    if (loading) return <LoadingSpinner />;
//    if (error) return <ErrorMessage error={error} />;
//    if (listings.length === 0) return <EmptyState />;

//    return (
//       <div>
//          <h2>Your Listings</h2>
//          <div className="listings-grid">
//             {listings.map((listing) => (
//                <ListingCard key={listing.id} listing={listing} />
//             ))}
//          </div>
//       </div>
//    );
// };
