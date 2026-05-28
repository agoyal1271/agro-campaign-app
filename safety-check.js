// Safety enforcement module
// Checks time windows, day restrictions, failure rates

const checkTimeWindow = () => {
  const hour = new Date().getHours();
  const sendStart = parseInt(process.env.SEND_HOURS_START || 10);
  const sendEnd = parseInt(process.env.SEND_HOURS_END || 14);

  if (hour < sendStart || hour >= sendEnd) {
    return {
      allowed: false,
      message: `⏸️ Outside send hours. Send window is ${sendStart}am-${sendEnd}pm. Current time: ${hour}:00. Please wait until ${sendStart}am.`
    };
  }

  return { allowed: true, message: null };
};

const checkDayOfWeek = () => {
  const day = new Date().getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
  const daysString = process.env.DAYS_TO_SEND || '1,3,5'; // Mon(1), Wed(3), Fri(5)
  const allowedDays = daysString.split(',').map(d => parseInt(d.trim()));

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = dayNames[day];

  if (!allowedDays.includes(day)) {
    const nextAllowedDay = allowedDays.find(d => d > day) || allowedDays[0];
    const nextDayName = dayNames[nextAllowedDay];
    return {
      allowed: false,
      message: `⏸️ Today (${todayName}) is not a send day. Send days are Mon/Wed/Fri only. Resume on ${nextDayName}.`
    };
  }

  return { allowed: true, message: null };
};

const checkFailureRate = (sent, failed) => {
  if (sent === 0) return { allowed: true, message: null };

  const failureRate = failed / sent;
  const threshold = parseFloat(process.env.FAILURE_RATE_THRESHOLD || 0.10);

  if (failureRate > threshold) {
    return {
      allowed: false,
      message: `🚨 Failure rate exceeded! Sent: ${sent}, Failed: ${failed} (${(failureRate * 100).toFixed(1)}% failure). Threshold: ${threshold * 100}%. Campaign auto-paused to prevent ban.`,
      shouldPause: true
    };
  }

  return { allowed: true, message: null };
};

const logSafetyCheck = (checkName, result) => {
  if (!result.allowed) {
    console.log(`\n⚠️  SAFETY CHECK FAILED: ${checkName}`);
    console.log(`   ${result.message}\n`);
  }
};

module.exports = {
  checkTimeWindow,
  checkDayOfWeek,
  checkFailureRate,
  logSafetyCheck
};
