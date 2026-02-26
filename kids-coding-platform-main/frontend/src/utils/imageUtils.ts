// Utility function to convert file to base64
export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Validate image file
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { isValid: false, error: 'Profile picture must be less than 5MB' };
  }
  
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'Please select a valid image file' };
  }
  
  return { isValid: true };
};
