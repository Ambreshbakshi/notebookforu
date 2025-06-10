const ProfileDetails = ({ email }) => {
    return (
      <div className="p-6 bg-gray-100 rounded-lg">
        <h2 className="text-2xl font-semibold">User Profile</h2>
        <p className="text-gray-700">Name: {email}</p>
        <p className="text-gray-700">Email: {email}</p>
      </div>
    );
  };
  
  export default ProfileDetails;
  