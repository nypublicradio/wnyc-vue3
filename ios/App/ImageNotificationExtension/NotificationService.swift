import UserNotifications
class NotificationService: UNNotificationServiceExtension {
    var contentHandler: ((UNNotificationContent) -> Void)?
    var bestAttemptContent: UNMutableNotificationContent?
    override func didReceive(_ request: UNNotificationRequest, withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {
        self.contentHandler = contentHandler
        bestAttemptContent = (request.content.mutableCopy() as? UNMutableNotificationContent)
        if let bestAttemptContent = bestAttemptContent {
            // Modify the notification content here...
            if let imageUrlString = bestAttemptContent.userInfo["imageUrl"] as? String, let imageUrl = URL(string: imageUrlString) {
                downloadImage(from: imageUrl) { (attachment) in
                    if let attachment = attachment {
                        bestAttemptContent.attachments = [attachment]
                    }
                    contentHandler(bestAttemptContent)
                }
            } else {
                contentHandler(bestAttemptContent)
            }
        }
    }
    override func serviceExtensionTimeWillExpire() {
        // Called just before the extension will be terminated by the system.
        if let contentHandler = contentHandler, let bestAttemptContent = bestAttemptContent {
            contentHandler(bestAttemptContent)
        }
    }
    private func downloadImage(from url: URL, completion: @escaping (UNNotificationAttachment?) -> Void) {
        let task = URLSession.shared.downloadTask(with: url) { (downloadedUrl, response, error) in
            if let downloadedUrl = downloadedUrl {
                let fileManager = FileManager.default
                let cacheDirectory = fileManager.urls(for: .cachesDirectory, in: .userDomainMask).first!
                let fileUrl = cacheDirectory.appendingPathComponent(url.lastPathComponent)
                do {
                    try fileManager.moveItem(at: downloadedUrl, to: fileUrl)
                    let attachment = try UNNotificationAttachment(identifier: "image", url: fileUrl, options: nil)
                    completion(attachment)
                } catch {
                    print("Error: \(error.localizedDescription)")
                    completion(nil)
                }
            } else {
                completion(nil)
            }
        }
        task.resume()
    }
}
