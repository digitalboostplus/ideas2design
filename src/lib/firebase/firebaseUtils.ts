import { db, storage, auth } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function saveImageToGallery(imageUrl: string, prompt: string, modelId: string): Promise<void> {
  if (!auth.currentUser) {
    throw new Error("User not authenticated. Cannot save image to gallery.");
  }

  try {
    // Fetch the image from imageUrl as a Blob
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();

    // Generate a unique image ID
    const imageId = Date.now().toString();

    // Create a Firebase Storage reference
    const storageRef = ref(storage, `user_galleries/${auth.currentUser.uid}/${imageId}.png`);

    // Upload the blob
    const snapshot = await uploadBytes(storageRef, blob);

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Add image metadata to Firestore
    await addDoc(collection(db, "userImages"), {
      userId: auth.currentUser.uid,
      prompt: prompt,
      modelId: modelId,
      imageUrl: downloadURL, // Store the Firebase Storage URL
      originalFalUrl: imageUrl, // Optionally store the original fal.ai URL for reference
      createdAt: serverTimestamp(),
    });

    console.log("Image saved to gallery successfully!");

  } catch (error) {
    console.error("Error saving image to gallery:", error);
    throw error; // Re-throw the error so the UI can catch it
  }
}
