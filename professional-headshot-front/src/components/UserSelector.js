import React, { useState, useEffect } from "react";
import Select from "react-select";
import { setUserId, getUserId } from "../utils/user";

const predefinedUsers = [
  { value: 1, label: "abel@gmail.com" },
  { value: 2, label: "gentrit@gmail.com" },
];

const getUsersFromLocalStorage = () => {
  const users = localStorage.getItem("users");
  return users ? JSON.parse(users) : predefinedUsers;
};

const UserSelector = ({ onUserSelect, onPhoneChange }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOptions, setUserOptions] = useState(getUsersFromLocalStorage());
  const [newUser, setNewUser] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [nextUserId, setNextUserId] = useState(
    userOptions?.length > 0
      ? Math.max(...userOptions.map((u) => u.value)) + 1
      : 1
  );

  useEffect(() => {
    const savedUserId = getUserId();
    let user;
    if (savedUserId) {
      user = userOptions.find(
        (user) => user.value === parseInt(savedUserId, 10)
      );
    } else {
      user = userOptions[0]; // Preselect the first user if no saved user ID
    }
    setSelectedUser(user);
    if (user) onUserSelect(user);
  }, [onUserSelect, userOptions]);

  const handleUserChange = (selectedOption) => {
    setSelectedUser(selectedOption);
    if (selectedOption) {
      setUserId(selectedOption.value);
      onUserSelect(selectedOption);
    } else {
      setUserId(null);
      onUserSelect(null);
    }
  };

  const handlePhoneNumberChange = (event) => {
    const phone = event.target.value;
    setPhoneNumber(phone);
    onPhoneChange(phone);
  };

  const handleAddUser = () => {
    if (newUser.trim()) {
      const newUserOption = { value: nextUserId, label: newUser.trim() };
      const updatedUsers = [...userOptions, newUserOption];
      setUserOptions(updatedUsers);
      setSelectedUser(newUserOption);
      setUserId(newUserOption.value);
      onUserSelect(newUserOption);
      setNewUser("");
      setNextUserId(nextUserId + 1);
      localStorage.setItem("users", JSON.stringify(updatedUsers));
    }
  };

  return (
    <div className="user-selector flex flex-col items-center">
      <label className="text-xl w-full font-sans text-start font-semibold text-gray-700 mb-2">
        Choose/Add your user:
      </label>
      <Select
        value={selectedUser}
        onChange={handleUserChange}
        options={userOptions}
        placeholder="Select your user email"
        isClearable
        isSearchable
        className="mb-4 w-full"
      />
      <div className="flex items-center w-full mb-4">
        <input
          type="text"
          value={newUser}
          onChange={(e) => setNewUser(e.target.value)}
          placeholder="Enter new user email"
          className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg mr-2 w-full transition-transform transform hover:scale-105 hover:shadow-lg"
        />
        <button
          onClick={handleAddUser}
          className="bg-purple-500 text-white py-2 px-6 rounded-2xl font-semibold hover:bg-purple-600 transition-transform transform hover:scale-105"
        >
          Add
        </button>
      </div>
      <div className="w-full">
        <input
          type="text"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          placeholder="Enter phone number (optional)"
          className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg w-full transition-transform transform hover:scale-105 hover:shadow-lg"
        />
      </div>
    </div>
  );
};

export default UserSelector;
