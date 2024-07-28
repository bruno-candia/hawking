class GenerateRandomTimesService {
  public async generateAndExecute(): Promise<void> {
    const { preferredTimes } = user;

    const entryTime = this.getRandomTimeInRange(
      preferredTimes.entry.start,
      preferredTimes.entry.end,
    );

    const today = new Date().getDay();
    const exitTimeRange =
      today === 5
        ? preferredTimes.exit.friday
        : preferredTimes.exit.mondayToThursday;
    const exitTime = this.getRandomTimeInRange(
      exitTimeRange.start,
      exitTimeRange.end,
    );

    console.log(
      `Usuário: ${user.name} - Entrada: ${entryTime}, Saída: ${exitTime}`,
    );

    // Adicione a lógica para executar a automação aqui
  }

  private getRandomTimeInRange(start: string, end: string): string {
    const startParts = start.split(":").map(Number);
    const endParts = end.split(":").map(Number);

    const startDate = new Date();
    startDate.setHours(startParts[0], startParts[1], 0, 0);

    const endDate = new Date();
    endDate.setHours(endParts[0], endParts[1], 0, 0);

    const randomTime = new Date(
      startDate.getTime() +
        Math.random() * (endDate.getTime() - startDate.getTime()),
    );

    const hours = randomTime.getHours().toString().padStart(2, "0");
    const minutes = randomTime.getMinutes().toString().padStart(2, "0");

    return `${hours}:${minutes}`;
  }
}

export default GenerateRandomTimesService;
