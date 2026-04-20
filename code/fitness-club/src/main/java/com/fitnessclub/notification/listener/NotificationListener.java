package com.fitnessclub.notification.listener;

import com.fitnessclub.notification.event.NotificationEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class NotificationListener {

    private static final Logger log = LoggerFactory.getLogger(NotificationListener.class);

    @Async
    @EventListener
    public void handleNotification(NotificationEvent event) {
        log.info("Notification [{}] for recipient [{}]: {}",
                event.getType(),
                event.getRecipientId(),
                event.getTemplateData());
    }
}
