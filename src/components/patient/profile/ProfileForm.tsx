import React, { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { getPatientProfile, updatePatientProfile } from "@/lib/services/patient.client";
import { Loader2 } from "lucide-react";

interface ProfileFormProps {
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export function ProfileForm({ addToast }: ProfileFormProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    address: "",
    emergencyName: "",
    emergencyPhone: "",
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getPatientProfile();
        if (data.role === "PATIENT") {
          // Parse emergency contact if it's combined
          let eName = "";
          let ePhone = "";
          if (data.profile.emergencyContact) {
            const parts = data.profile.emergencyContact.split(" | Phone: ");
            if (parts.length === 2) {
                eName = parts[0].replace("Name: ", "");
                ePhone = parts[1];
            } else {
                eName = data.profile.emergencyContact;
            }
          }

          setFormData({
            name: data.profile.name,
            email: data.user.email,
            contact: data.profile.contact || "",
            address: data.profile.address || "",
            emergencyName: eName,
            emergencyPhone: ePhone,
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
        addToast("error", "Failed to load profile data");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [addToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Combine emergency contact
    let emergencyContact = "";
    if (formData.emergencyName || formData.emergencyPhone) {
        emergencyContact = `Name: ${formData.emergencyName} | Phone: ${formData.emergencyPhone}`;
    }

    try {
      await updatePatientProfile({
        name: formData.name,
        contact: formData.contact,
        address: formData.address,
        emergencyContact: emergencyContact,
      });
      addToast("success", "Profile updated successfully");
    } catch (error: any) {
      console.error("Failed to update profile", error);
      addToast("error", error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="name" className="text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            disabled
            className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="contact" className="text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            id="contact"
            type="tel"
            value={formData.contact}
            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="col-span-1 sm:col-span-2 space-y-2">
          <label htmlFor="address" className="text-sm font-medium text-gray-700">
            Address
          </label>
          <input
            id="address"
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        
        {/* Emergency Contact */}
        <div className="col-span-1 sm:col-span-2">
           <h3 className="mb-4 text-base font-semibold text-gray-900 border-b pb-2">Emergency Contact</h3>
           <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
             <div className="space-y-2">
                <label htmlFor="emergencyName" className="text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  id="emergencyName"
                  type="text"
                  value={formData.emergencyName}
                  onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                  placeholder="Contact Name"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
             </div>
             <div className="space-y-2">
                <label htmlFor="emergencyPhone" className="text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  id="emergencyPhone"
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                  placeholder="Contact Phone"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
             </div>
           </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}
