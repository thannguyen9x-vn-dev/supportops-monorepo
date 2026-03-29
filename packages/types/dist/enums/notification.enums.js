export var NotificationEventType;
(function (NotificationEventType) {
    NotificationEventType["REQUEST_CREATED"] = "REQUEST_CREATED";
    NotificationEventType["REQUEST_ASSIGNED"] = "REQUEST_ASSIGNED";
    NotificationEventType["REQUEST_STATUS_CHANGED"] = "REQUEST_STATUS_CHANGED";
    NotificationEventType["REQUEST_COMMENTED"] = "REQUEST_COMMENTED";
    NotificationEventType["REQUEST_MENTIONED"] = "REQUEST_MENTIONED";
    NotificationEventType["SLA_NEAR_BREACH_RESPONSE"] = "SLA_NEAR_BREACH_RESPONSE";
    NotificationEventType["SLA_NEAR_BREACH_RESOLUTION"] = "SLA_NEAR_BREACH_RESOLUTION";
})(NotificationEventType || (NotificationEventType = {}));
export var NotificationChannel;
(function (NotificationChannel) {
    NotificationChannel["IN_APP"] = "IN_APP";
    NotificationChannel["EMAIL"] = "EMAIL";
})(NotificationChannel || (NotificationChannel = {}));
