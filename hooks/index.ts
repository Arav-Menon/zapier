import express from "express";
import { hooks_db } from "@hooks_db/index";

const app = express();

app.use(express.json());

app.post("/hooks/catch/:userId/:zapId", async (req, res) => {
  const userId = req.params.userId;
  const zapId = req.params.zapId;
  const body = req.body;

  await hooks_db.$transaction(async (tx) => {
    const rn = await tx.zapRun.create({
      data: {
        zapId: zapId,
        metadata: body,
      },
    });

    await tx.zapRunOutbox.create({
      data: {
        zapRunId: rn.id,
      },
    });
  });

  res.status(201).json({
    message: "Webhook recieved",
  });
});
