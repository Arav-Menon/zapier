import { hooks_db } from "@hooks_db/index";
import { Kafka } from "kafkajs";

const TOPIC_NAME = "zap-events";

const kafka = new Kafka({
  clientId: "outbox-processor",
  brokers: ["localhost:9092"],
});

async function main() {
  const processor = kafka.producer();
  await processor.connect();
  while (1) {
    const pendingRows = await hooks_db.zapRunOutbox.findMany({
      where: {},
      take: 10,
    });

    processor.send({
      topic: TOPIC_NAME,
      messages: pendingRows.map((r) => {
        return {
          value: r.zapRunId,
        };
      }),
    });
  }
}
main();
