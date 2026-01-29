import { useState } from "react";
import { Camera, Building2, MapPin, Mail, X, Link as LinkIcon } from "lucide-react";

const EditProfileModal = ({ isOpen, onClose, userProfile, onSave }) => {
  const [formData, setFormData] = useState({
    name: userProfile?.name || "",
    bio: userProfile?.bio || "",
    pronouns: userProfile?.pronouns || "",
    company: userProfile?.company || "",
    location: userProfile?.location || "",
    displayLocalTime: userProfile?.displayLocalTime || false,
    timezone: userProfile?.timezone || "(GMT-12:00) International Date Line West",
    email: userProfile?.email || "",
    website: userProfile?.website || "",
    socialLinks: userProfile?.socialLinks || ["", "", "", ""],
  });

  const [avatarPreview, setAvatarPreview] = useState(
    userProfile?.avatar || "https://avatars.githubusercontent.com/u/1?v=4"
  );

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSocialLinkChange = (index, value) => {
    const newSocialLinks = [...formData.socialLinks];
    newSocialLinks[index] = value;
    setFormData((prev) => ({
      ...prev,
      socialLinks: newSocialLinks,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave({
      ...formData,
      avatar: avatarPreview,
    });
    onClose();
  };

  const timezones = [
    "(GMT-12:00) International Date Line West",
    "(GMT-11:00) Midway Island, Samoa",
    "(GMT-10:00) Hawaii",
    "(GMT-09:00) Alaska",
    "(GMT-08:00) Pacific Time (US & Canada)",
    "(GMT-07:00) Mountain Time (US & Canada)",
    "(GMT-06:00) Central Time (US & Canada)",
    "(GMT-05:00) Eastern Time (US & Canada)",
    "(GMT-04:00) Atlantic Time (Canada)",
    "(GMT-03:00) Brasilia, Buenos Aires",
    "(GMT-02:00) Mid-Atlantic",
    "(GMT-01:00) Azores, Cape Verde Islands",
    "(GMT+00:00) London, Dublin, Lisbon",
    "(GMT+01:00) Paris, Brussels, Berlin",
    "(GMT+02:00) Cairo, Athens, Helsinki",
    "(GMT+03:00) Moscow, Kuwait, Riyadh",
    "(GMT+04:00) Abu Dhabi, Muscat",
    "(GMT+05:00) Islamabad, Karachi, Tashkent",
    "(GMT+05:30) Mumbai, Kolkata, Chennai",
    "(GMT+06:00) Almaty, Dhaka",
    "(GMT+07:00) Bangkok, Hanoi, Jakarta",
    "(GMT+08:00) Beijing, Singapore, Hong Kong",
    "(GMT+09:00) Tokyo, Seoul, Osaka",
    "(GMT+10:00) Sydney, Melbourne, Guam",
    "(GMT+11:00) Magadan, Solomon Islands",
    "(GMT+12:00) Auckland, Wellington, Fiji",
  ];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {/* Profile Picture */}
          <div className="space-y-2">
            <label className="text-sm font-semibold block">Profile picture</label>
            <div className="flex items-center gap-4">
              <img
                src={avatarPreview}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover"
              />
              <div>
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <label htmlFor="avatar-upload">
                  <button
                    type="button"
                    onClick={() => document.getElementById("avatar-upload").click()}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Change picture
                  </button>
                </label>
              </div>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-semibold block">
              Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Your name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label htmlFor="bio" className="text-sm font-semibold block">
              Bio
            </label>
            <textarea
              id="bio"
              placeholder="Add a bio"
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none"
              maxLength={160}
            />
            <p className="text-xs text-gray-500">
              You can @mention other users and organizations to link to them.
            </p>
          </div>

          {/* Pronouns */}
          <div className="space-y-2">
            <label htmlFor="pronouns" className="text-sm font-semibold block">
              Pronouns
            </label>
            <select
              id="pronouns"
              value={formData.pronouns}
              onChange={(e) => handleInputChange("pronouns", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select pronouns</option>
              <option value="he/him">he/him</option>
              <option value="she/her">she/her</option>
              <option value="they/them">they/them</option>
              <option value="custom">Custom</option>
              <option value="not-specified">Don't specify</option>
            </select>
          </div>

          {/* Company */}
          <div className="space-y-2">
            <label htmlFor="company" className="text-sm font-semibold block flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Company
            </label>
            <input
              id="company"
              type="text"
              placeholder="Your company"
              value={formData.company}
              onChange={(e) => handleInputChange("company", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-semibold block flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </label>
            <input
              id="location"
              type="text"
              placeholder="Your location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Display Local Time */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="displayLocalTime"
                checked={formData.displayLocalTime}
                onChange={(e) => handleInputChange("displayLocalTime", e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="displayLocalTime" className="text-sm cursor-pointer">
                Display current local time
              </label>
            </div>

            {formData.displayLocalTime && (
              <select
                value={formData.timezone}
                onChange={(e) => handleInputChange("timezone", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold block flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </label>
            <select
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select email</option>
              <option value="momanamjad07@gmail.com">momanamjad07@gmail.com</option>
            </select>
          </div>

          {/* Website */}
          <div className="space-y-2">
            <label htmlFor="website" className="text-sm font-semibold block flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Website
            </label>
            <input
              id="website"
              type="url"
              placeholder="https://example.com"
              value={formData.website}
              onChange={(e) => handleInputChange("website", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Social Accounts */}
          <div className="space-y-2">
            <label className="text-sm font-semibold block">Social accounts</label>
            <div className="space-y-2">
              {formData.socialLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    placeholder={`Link to social profile ${index + 1}`}
                    value={link}
                    onChange={(e) => handleSocialLinkChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
