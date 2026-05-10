import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserWishlist = () => {
  const [items, _setItems] = useState<any[]>([]);
  const [loading, _setLoading] = useState(false);

  if (loading) {
    return (
       <div className="p-8 flex justify-center items-center min-h-[400px]">
         <div className="w-10 h-10 border-4 border-primary-800 rounded-full animate-spin"></div>
       </div>
    );
  }

  return (
    <div className="p-6 md:p-8 min-h-screen">
      <h1 className="text-2xl font-serif text-primary-950 mb-6">My Wishlist</h1>
      {items.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-serif text-gray-900 mb-2">Your wishlist is empty</h3>
          <Link to="/shop" className="bg-primary-950 text-white px-8 py-3 rounded text-sm font-bold uppercase tracking-widest">Discover Styles</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        </div>
      )}
    </div>
  );
};

export default UserWishlist;
