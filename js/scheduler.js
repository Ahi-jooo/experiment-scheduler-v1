// Schedule calculation logic

// Parses HH:MM to minutes from midnight
function timeToMin(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// Formats minutes from midnight to HH:MM
function minToTime(mins) {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// Time boundary rules
const DAY_START_MIN = 9 * 60;  // 9:00
const DAY_END_MIN = 22 * 60;   // 22:00

// Checks if a given time block overlaps with any unavailable rules
function hasConflict(currentDate, startMin, endMin, unavailableTimes) {
  // Convert current date context
  const dayOfWeek = currentDate.getDay(); // 0: Sun ... 6: Sat
  const dateStr = currentDate.toISOString().split('T')[0];

  for (const rule of unavailableTimes) {
    let ruleMatchesDay = false;
    if (rule.type === 'weekly' && parseInt(rule.day, 10) === dayOfWeek) {
      ruleMatchesDay = true;
    } else if (rule.type === 'single' && rule.date === dateStr) {
      ruleMatchesDay = true;
    }

    if (ruleMatchesDay) {
      const ruleStart = timeToMin(rule.start);
      const ruleEnd = timeToMin(rule.end);
      
      // Conflict condition: max(startMin, ruleStart) < min(endMin, ruleEnd)
      if (Math.max(startMin, ruleStart) < Math.min(endMin, ruleEnd)) {
        return ruleEnd; // Return time when rule ends, to attempt jump
      }
    }
  }

  // Also check bounds 22:00
  if (endMin > DAY_END_MIN) {
     return DAY_END_MIN; // Signal out of bounds
  }
  
  return null; // No conflict
}

/**
 * Calculates start and end times for each step
 * @param {string} startHHMM - "09:00" format
 * @param {Array} steps - List of steps
 * @param {Array} unavailableTimes - Rules of unavailable times
 * @param {Date} startDate - Initial date
 * @returns {Array} List of calculated blocks
 */
function generateSchedule(startHHMM, steps, unavailableTimes, startDateStr) {
  let blocks = [];
  
  let currentMin = timeToMin(startHHMM);
  
  // Create Date object correctly handling timezones (avoiding UTC shift issues on YYYY-MM-DD)
  let currentDate = startDateStr ? new Date(startDateStr + 'T00:00:00') : new Date();
  currentDate.setHours(0, 0, 0, 0); 
  
  // Ensure start is not before 9:00 (unless it's overnight continuation)
  if (currentMin < DAY_START_MIN) {
    currentMin = DAY_START_MIN;
  }

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const duration = parseInt(step.durationMin, 10);
    if (!duration || duration <= 0) continue;

    if (step.type === 'action') {
      // Find a slot for action
      let slotFound = false;
      while (!slotFound) {
        // Must fit within 09:00-22:00
        if (currentMin + duration > DAY_END_MIN) {
          // Push to next day 09:00
          currentDate.setDate(currentDate.getDate() + 1);
          currentMin = DAY_START_MIN;
          continue; // Re-evaluate on new day
        }

        // Check for conflicts
        const conflictEndMin = hasConflict(currentDate, currentMin, currentMin + duration, unavailableTimes);
        
        if (conflictEndMin !== null) {
          if (conflictEndMin === DAY_END_MIN) {
            // Out of bounds, jump to next day
            currentDate.setDate(currentDate.getDate() + 1);
            currentMin = DAY_START_MIN;
          } else {
            // Jump to end of conflict
            currentMin = Math.max(currentMin, conflictEndMin);
          }
        } else {
          // Fits perfectly
          slotFound = true;
        }
      }
      
      const endMin = currentMin + duration;
      blocks.push({
        ...step,
        originalIndex: i,
        startMin: currentMin,
        endMin: endMin,
        date: new Date(currentDate),
        startTimeStr: minToTime(currentMin),
        endTimeStr: minToTime(endMin)
      });
      currentMin = endMin;
    } else {
      // Wait time - can happen anytime, even overnight or during conflicts
      // Just add time. If it crosses midnight, split block for UI display.
      let remainingDuration = duration;
      let startOfWait = currentMin;

      while (remainingDuration > 0) {
        const timeUntilMidnight = (24 * 60) - startOfWait;
        let blockDuration = Math.min(remainingDuration, timeUntilMidnight);

        let endMin = startOfWait + blockDuration;
        blocks.push({
          ...step,
          originalIndex: i,
          isSplit: Math.min(remainingDuration, timeUntilMidnight) !== remainingDuration,
          startMin: startOfWait,
          endMin: (endMin === 24 * 60) ? 0 : endMin, // Midnight represented as 0
          date: new Date(currentDate),
          startTimeStr: minToTime(startOfWait),
          endTimeStr: (endMin === 24 * 60) ? "00:00" : minToTime(endMin),
          actualDuration: blockDuration
        });
        
        remainingDuration -= blockDuration;
        if (remainingDuration > 0) {
          // Go to next day
          currentDate.setDate(currentDate.getDate() + 1);
          startOfWait = 0; // Midnight start
        } else {
          currentMin = endMin;
        }
      }
    }
  }

  return blocks;
}
