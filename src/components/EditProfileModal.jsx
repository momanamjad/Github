import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Building2, MapPin, Mail, Link as LinkIcon } from "lucide-react";

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Profile Picture */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Profile picture</Label>
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={avatarPreview} />
                <AvatarFallback>
                  {formData.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <label htmlFor="avatar-upload">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() =>
                      document.getElementById("avatar-upload").click()
                    }
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Change picture
                  </Button>
                </label>
              </div>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold">
              Name
            </Label>
            <Input
              id="name"
              placeholder="Your name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-semibold">
              Bio
            </Label>
            <Textarea
              id="bio"
              placeholder="Add a bio"
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              className="w-full min-h-[100px] resize-none"
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground">
              You can @mention other users and organizations to link to them.
            </p>
          </div>

          {/* Pronouns */}
          <div className="space-y-2">
            <Label htmlFor="pronouns" className="text-sm font-semibold">
              Pronouns
            </Label>
            <Select
              value={formData.pronouns}
              onValueChange={(value) => handleInputChange("pronouns", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select pronouns" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="he/him">he/him</SelectItem>
                <SelectItem value="she/her">she/her</SelectItem>
                <SelectItem value="they/them">they/them</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
                <SelectItem value="not-specified">
                  Don't specify
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Company */}
          <div className="space-y-2">
            <Label htmlFor="company" className="text-sm font-semibold">
              <Building2 className="w-4 h-4 inline mr-2" />
              Company
            </Label>
            <Input
              id="company"
              placeholder="Your company"
              value={formData.company}
              onChange={(e) => handleInputChange("company", e.target.value)}
              className="w-full"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-semibold">
              <MapPin className="w-4 h-4 inline mr-2" />
              Location
            </Label>
            <Input
              id="location"
              placeholder="Your location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              className="w-full"
            />
          </div>

          {/* Display Local Time */}
          <div className="space-y-3">
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
                <SelectTrigger className="w-full">
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

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold">
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </Label>
            <Select
              value={formData.email}
              onValueChange={(value) => handleInputChange("email", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select email" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="momanamjad07@gmail.com">
                  momanamjad07@gmail.com
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website" className="text-sm font-semibold">
              <LinkIcon className="w-4 h-4 inline mr-2" />
              Website
            </Label>
            <Input
              id="website"
              type="url"
              placeholder="https://example.com"
              value={formData.website}
              onChange={(e) => handleInputChange("website", e.target.value)}
              className="w-full"
            />
          </div>

          {/* Social Accounts */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Social accounts</Label>
            <div className="space-y-2">
              {formData.socialLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={`Link to social profile ${index + 1}`}
                    value={link}
                    onChange={(e) =>
                      handleSocialLinkChange(index, e.target.value)
                    }
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
