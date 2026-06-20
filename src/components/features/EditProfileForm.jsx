import { useState } from "react";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Textarea } from "@ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, MapPin, Link as LinkIcon, Camera } from "lucide-react";
import { apiClient } from "../../services/apiClient";

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

const EditProfileForm = ({ userProfile, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: userProfile?.name || "",
    bio: userProfile?.bio || "",
    pronouns: userProfile?.pronouns || "",
    company: userProfile?.company || "",
    location: userProfile?.location || "",
    displayLocalTime: userProfile?.displayLocalTime || false,
    timezone:
      userProfile?.timezone || "(GMT-12:00) International Date Line West",
    website: userProfile?.website || "",
    socialLinks: userProfile?.socialLinks || ["", "", "", ""],
    avatar: userProfile?.avatar || "/profile.webp",
  });

  const [uploading, setUploading] = useState(false);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("avatar", file);

    try {
      setUploading(true);
      const res = await apiClient("/upload", {
        method: "POST",
        body: data,
      });
      if (res.success && res.url) {
        handleInputChange("avatar", res.url);
      }
    } catch (err) {
      alert("Failed to upload avatar: " + err.message);
    } finally {
      setUploading(false);
    }
  };

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

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="space-y-4 py-4 w-full">
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Profile picture</Label>
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border border-[#d0d7de]">
            <img src={formData.avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
          </div>
          <div>
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              disabled={uploading}
            />
            <label htmlFor="avatar-upload">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer"
                disabled={uploading}
                onClick={() =>
                  document.getElementById("avatar-upload").click()
                }
              >
                <Camera className="w-4 h-4 mr-2" />
                {uploading ? "Uploading..." : "Change picture"}
              </Button>
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="name" className="text-sm font-semibold">
          Name
        </Label>
        <Input
          id="name"
          placeholder="Your name"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          className="w-full text-sm h-8"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="bio" className="text-sm font-semibold">
          Bio
        </Label>
        <Textarea
          id="bio"
          placeholder="Add a bio"
          value={formData.bio}
          onChange={(e) => handleInputChange("bio", e.target.value)}
          className="w-full min-h-[80px] resize-none text-sm"
          maxLength={160}
        />
        <p className="text-xs text-muted-foreground mt-1">
          You can @mention other users and organizations to link to them.
        </p>
      </div>

      <div className="space-y-1">
        <Label htmlFor="pronouns" className="text-sm font-semibold">
          Pronouns
        </Label>
        <Select
          value={formData.pronouns}
          onValueChange={(value) => handleInputChange("pronouns", value)}
        >
          <SelectTrigger className="w-full h-8 text-sm">
            <SelectValue placeholder="Select pronouns" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="he/him">he/him</SelectItem>
            <SelectItem value="she/her">she/her</SelectItem>
            <SelectItem value="they/them">they/them</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
            <SelectItem value="not-specified">Don't specify</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label
          htmlFor="company"
          className="text-sm font-semibold flex items-center"
        >
          <Building2 className="w-4 h-4 mr-2" />
          Company
        </Label>
        <Input
          id="company"
          placeholder="Your company"
          value={formData.company}
          onChange={(e) => handleInputChange("company", e.target.value)}
          className="w-full h-8 text-sm"
        />
      </div>

      <div className="space-y-1">
        <Label
          htmlFor="location"
          className="text-sm font-semibold flex items-center"
        >
          <MapPin className="w-4 h-4 mr-2" />
          Location
        </Label>
        <Input
          id="location"
          placeholder="Your location"
          value={formData.location}
          onChange={(e) => handleInputChange("location", e.target.value)}
          className="w-full h-8 text-sm"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="displayLocalTime"
            checked={formData.displayLocalTime}
            onCheckedChange={(checked) =>
              handleInputChange("displayLocalTime", checked)
            }
          />
          <Label
            htmlFor="displayLocalTime"
            className="text-sm font-normal cursor-pointer"
          >
            Display current local time
          </Label>
        </div>

        {formData.displayLocalTime && (
          <Select
            value={formData.timezone}
            onValueChange={(value) => handleInputChange("timezone", value)}
          >
            <SelectTrigger className="w-full h-8 text-sm mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {timezones.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-1">
        <Label
          htmlFor="website"
          className="text-sm font-semibold flex items-center"
        >
          <LinkIcon className="w-4 h-4 mr-2" />
          Website
        </Label>
        <Input
          id="website"
          type="url"
          placeholder="https://example.com"
          value={formData.website}
          onChange={(e) => handleInputChange("website", e.target.value)}
          className="w-full h-8 text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold">Social accounts</Label>
        <div className="space-y-2">
          {formData.socialLinks.map((link, index) => (
            <div key={index} className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={`Link to social profile ${index + 1}`}
                value={link}
                onChange={(e) => handleSocialLinkChange(index, e.target.value)}
                className="flex-1 h-8 text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-start gap-2 pt-2">
        <Button
          onClick={handleSave}
          className="bg-[#2da44e] hover:bg-[#2c974b] text-white font-semibold text-sm h-8 px-4"
        >
          Save
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          className="text-sm h-8 px-4 bg-[#f6f8fa] hover:bg-[#f3f4f6]"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default EditProfileForm;
