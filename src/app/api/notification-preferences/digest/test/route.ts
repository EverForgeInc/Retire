import { handleRouteError, jsonOk, requireMemberContext } from "@/lib/api";
import { queueTestDigest } from "@/lib/digest";

export async function POST() {
  try {
    const { session } = await requireMemberContext();
    const result = await queueTestDigest(session.userId);
    return jsonOk(
      {
        queued: !result.payload.skipped,
        delivery: result.delivery,
        preview: {
          taskCount: result.payload.tasks.length,
          subject: "subject" in result.payload ? result.payload.subject : null,
          tasks: result.payload.tasks,
          note: "Test digests are queued locally. Email bodies exclude medical and VA narrative content.",
        },
      },
      { status: 202 },
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
