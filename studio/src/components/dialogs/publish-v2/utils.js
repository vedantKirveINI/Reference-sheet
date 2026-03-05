const combineDateAndTime = (date, time) => {
  if (!date) return null;
  if (!time) return date;
  const dateObj = new Date(date);
  const [hours, minutes] = time.split(':').map(Number);
  dateObj.setHours(hours, minutes, 0, 0);
  return dateObj.toISOString();
};

export const transformSettingsToPayload = (settings) => {
  const scheduleAt = combineDateAndTime(settings.scheduleDate, settings.scheduleTime);
  const closeAt = combineDateAndTime(settings.autoCloseDate, settings.autoCloseTime);

  return {
    form: {
      password: settings.isPasswordProtected ? settings.password : null,
      schedule_at: settings.isScheduled ? scheduleAt : null,
      is_max_responses_enabled: settings.isRespondentLimitEnabled,
      max_responses: settings.respondentLimit,
      is_close_at_enabled: settings.isAutoCloseEnabled,
      close_at: closeAt,
      remove_branding: settings.removeBranding,
      custom_logo: settings.customLogo,
      notify_on_response: settings.notifyOnResponse,
      notify_email: settings.notifyEmail,
      collect_location: settings.collectLocation,
      collect_ip: settings.collectIP,
    },
    tracking: {
      ga_enabled: settings.gaEnabled,
      ga_id: settings.gaId,
      gtm_enabled: settings.gtmEnabled,
      gtm_id: settings.gtmId,
      meta_pixel_enabled: settings.metaPixelEnabled,
      meta_pixel_id: settings.metaPixelId,
    },
  };
};
