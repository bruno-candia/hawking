import { AutoClockEntity } from "@src/domain/entities/autoclockEntity";

const userTokens = new Map<string, string>();
const userDataMap = new Map<string, { token: string; data: any }>();
const userAutoClock = new Map<string, AutoClockEntity>();
const userFirstInteraction = new Map<string, boolean>();

export { userTokens, userDataMap, userFirstInteraction, userAutoClock };
