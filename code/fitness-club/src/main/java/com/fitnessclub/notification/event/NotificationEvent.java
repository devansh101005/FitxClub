package com.fitnessclub.notification.event;

import org.springframework.context.ApplicationEvent;
import java.util.Map;
import java.util.UUID;

public class NotificationEvent extends ApplicationEvent {

    private final UUID recipientId;
    private final NotificationType type;
    private final Map<String, String> templateData;

    public NotificationEvent(Object source, UUID recipientId, NotificationType type, Map<String, String> templateData) {
        super(source);
        this.recipientId = recipientId;
        this.type = type;
        this.templateData = templateData;
    }

    public UUID getRecipientId() { return recipientId; }
    public NotificationType getType() { return type; }
    public Map<String, String> getTemplateData() { return templateData; }
}
