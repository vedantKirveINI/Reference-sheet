export class WaitExecutor {
  async execute(node, context, options) {
    const waitConfig = node.waitConfig || {};
    const waitType = waitConfig.type || "duration";

    let scheduledResumeAt = null;
    let waitingForEvent = null;

    switch (waitType) {
      case "duration":
        scheduledResumeAt = this.calculateDurationResume(waitConfig);
        break;
      
      case "until_time":
        scheduledResumeAt = this.calculateUntilTimeResume(waitConfig, context);
        break;
      
      case "countdown":
        scheduledResumeAt = this.calculateCountdownResume(waitConfig, context);
        break;
      
      case "event":
        waitingForEvent = waitConfig.eventType || "generic_event";
        if (waitConfig.timeout) {
          scheduledResumeAt = this.calculateDurationResume({ 
            duration: waitConfig.timeout, 
            unit: waitConfig.timeoutUnit || "hours" 
          });
        }
        break;
      
      default:
        scheduledResumeAt = new Date(Date.now() + 60000);
    }

    return {
      status: "waiting",
      context: {
        ...context,
        [`${node.key}_waitStartedAt`]: new Date().toISOString(),
        [`${node.key}_waitType`]: waitType,
        [`${node.key}_scheduledResumeAt`]: scheduledResumeAt?.toISOString(),
      },
      scheduledResumeAt,
      waitingForEvent,
    };
  }

  calculateDurationResume(config) {
    const { duration, unit, excludeWeekends = false } = config;
    
    if (!duration || duration <= 0) {
      return new Date(Date.now() + 60000);
    }

    let milliseconds;
    switch (unit) {
      case "seconds":
        milliseconds = duration * 1000;
        break;
      case "minutes":
        milliseconds = duration * 60 * 1000;
        break;
      case "hours":
        milliseconds = duration * 60 * 60 * 1000;
        break;
      case "days":
        milliseconds = duration * 24 * 60 * 60 * 1000;
        break;
      case "weeks":
        milliseconds = duration * 7 * 24 * 60 * 60 * 1000;
        break;
      case "business_days":
        return this.addBusinessDays(new Date(), duration);
      default:
        milliseconds = duration * 60 * 1000;
    }

    const resumeDate = new Date(Date.now() + milliseconds);

    if (excludeWeekends) {
      return this.adjustForWeekends(resumeDate);
    }

    return resumeDate;
  }

  calculateUntilTimeResume(config, context) {
    const { targetTime, timezone = "UTC" } = config;
    
    if (!targetTime) {
      return new Date(Date.now() + 60000);
    }

    const now = new Date();
    let targetDate;

    if (targetTime.includes("T") || targetTime.includes("-")) {
      targetDate = new Date(targetTime);
    } else {
      const [hours, minutes] = targetTime.split(":").map(Number);
      targetDate = new Date(now);
      targetDate.setHours(hours, minutes, 0, 0);
      
      if (targetDate <= now) {
        targetDate.setDate(targetDate.getDate() + 1);
      }
    }

    return targetDate;
  }

  calculateCountdownResume(config, context) {
    const { referenceField, beforeDuration, beforeUnit } = config;
    
    const referenceValue = this.getValueByPath(context, referenceField);
    if (!referenceValue) {
      return new Date(Date.now() + 60000);
    }

    const referenceDate = new Date(referenceValue);
    if (isNaN(referenceDate.getTime())) {
      return new Date(Date.now() + 60000);
    }

    let millisecondsBefore;
    switch (beforeUnit) {
      case "minutes":
        millisecondsBefore = beforeDuration * 60 * 1000;
        break;
      case "hours":
        millisecondsBefore = beforeDuration * 60 * 60 * 1000;
        break;
      case "days":
        millisecondsBefore = beforeDuration * 24 * 60 * 60 * 1000;
        break;
      default:
        millisecondsBefore = beforeDuration * 60 * 60 * 1000;
    }

    const resumeDate = new Date(referenceDate.getTime() - millisecondsBefore);

    if (resumeDate <= new Date()) {
      return new Date();
    }

    return resumeDate;
  }

  addBusinessDays(startDate, days) {
    let currentDate = new Date(startDate);
    let remainingDays = days;

    while (remainingDays > 0) {
      currentDate.setDate(currentDate.getDate() + 1);
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        remainingDays--;
      }
    }

    return currentDate;
  }

  adjustForWeekends(date) {
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 6) {
      date.setDate(date.getDate() + 2);
    } else if (dayOfWeek === 0) {
      date.setDate(date.getDate() + 1);
    }
    return date;
  }

  getValueByPath(obj, path) {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }
}
