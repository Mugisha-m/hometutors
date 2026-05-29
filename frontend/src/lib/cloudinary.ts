export async function uploadToCloudinary(file: File, token: string): Promise<string> {
  const signRes = await fetch("http://localhost:4000/api/upload/sign", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const { data } = await signRes.json();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("timestamp", data.timestamp);
  formData.append("signature", data.signature);
  formData.append("folder", data.folder);
  formData.append("api_key", data.apiKey);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${data.cloudName}/image/upload`,
    { method: "POST", body: formData }
  );
  const result = await uploadRes.json();
  if (!result.secure_url) throw new Error("Upload failed");
  return result.secure_url;
}
