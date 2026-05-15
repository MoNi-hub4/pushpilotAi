import { connectDB } from "@/lib/mongodb";
import PushNotification from "@/models/PushNotification";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectDB();

    const pns = await PushNotification.find()
      .sort({ createdAt: -1 })
      .limit(100);

    return Response.json({ success: true, data: pns });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}