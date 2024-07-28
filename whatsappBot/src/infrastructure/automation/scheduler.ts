import { CronJob } from "cron";

import GenerateRandomTimesService from "@src/services/GenerateRandomTimesService";

const generateRandomTimesService = new GenerateRandomTimesService();

// const isDevelopment = process.env.NODE_ENV === "development";

// Cron expression para rodar a cada minuto em desenvolvimento, e à meia-noite em produção
const cronExpression = "*/1 * * * *";

const job = new CronJob(cronExpression, async () => {
  try {
    await generateRandomTimesService.generateAndExecute();
    console.log("Tarefa executada com sucesso.");
  } catch (error) {
    console.error("Erro ao executar tarefa:", error);
  }
});

job.start();

console.log(
  `Scheduler iniciado e rodará com a expressão cron: ${cronExpression}`,
);
