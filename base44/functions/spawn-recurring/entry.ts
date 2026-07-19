import { createClientFromRequest } from "npm:@base44/sdk";

export default Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Use service role since this is a system operation
    // We need to fetch all active recurring commitments whose next_spawn_time is in the past
    // The Base44 SDK filter method format: filter(query, sort, limit, skip)
    // Unfortunately we can't easily query "next_spawn_time <= now" via basic equality filter if it only supports exact matches.
    // If it supports inequality, we can do it, but to be safe and robust, we can fetch active ones and filter in memory since this is a small mock app.
    const allRecurring = await base44.asServiceRole.entities.RecurringCommitment.filter(
      { active: true },
      "-created_date",
      1000
    );

    const now = new Date();
    let spawnedCount = 0;

    for (const recurring of allRecurring) {
      const nextTime = new Date(recurring.next_spawn_time);
      if (nextTime <= now) {
        // Time to spawn!
        // 1. Create a new Commitment based on the template
        // Calculate deadline (e.g. end of day/week/month based on frequency)
        // For simplicity, let's just make the deadline exactly 1 period from the spawn time
        const deadline = new Date(nextTime);
        if (recurring.frequency === "daily") {
          deadline.setDate(deadline.getDate() + 1);
        } else if (recurring.frequency === "weekly") {
          deadline.setDate(deadline.getDate() + 7);
        } else if (recurring.frequency === "monthly") {
          deadline.setMonth(deadline.getMonth() + 1);
        }

        await base44.asServiceRole.entities.Commitment.create({
          title: recurring.title,
          description: recurring.description,
          category: recurring.category,
          stake_amount: recurring.stake_amount,
          deadline: deadline.toISOString(),
          status: "active",
          creator_name: recurring.creator_name,
          created_by_id: recurring.created_by_id, // Inherit the creator
          pool_total: 0,
          back_total: 0,
          doubt_total: 0,
          backers: [],
          session_id: recurring.session_id
        });

        // 2. Update the next_spawn_time of the recurring template
        const nextNextTime = new Date(deadline); // The next spawn is exactly at the deadline of the newly created one!
        await base44.asServiceRole.entities.RecurringCommitment.update(recurring.id, {
          next_spawn_time: nextNextTime.toISOString()
        });

        spawnedCount++;
      }
    }

    return Response.json({
      success: true,
      spawned: spawnedCount
    });

  } catch (error) {
    console.error("Error in spawn-recurring:", error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});
