export interface AutoClockEntity {
  preferredTimes: {
    exit: {
      mondayToThursday: {
        start: string;
        end: string;
      };
      friday: {
        start: string;
        end: string;
      };
    };
    entry: {
      start: string;
      end: string;
    };
  };
}
