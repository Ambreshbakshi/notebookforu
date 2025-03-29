const CartItem = ({ item, removeItem }) => {
    return (
      <div className="flex justify-between items-center border-b py-4">
        <div>
          <h2 className="text-lg font-semibold">{item.name}</h2>
          <p className="text-gray-600">{item.price}</p>
        </div>
        <button
          onClick={() => removeItem(item.id)}
          className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
        >
          Remove
        </button>
      </div>
    );
  };
  
  export default CartItem;
  