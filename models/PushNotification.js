import mongoose from "mongoose";

const PushNotificationSchema = new mongoose.Schema(
  {
    keyword: String,
    promo: String,
    category: String,
    brand: String,
    tone: String,
    header: String,
    body: String,
    reason: String,
  },
  { timestamps: true }
);

delete mongoose.models.PushNotification;

export default mongoose.model("PushNotification", PushNotificationSchema);