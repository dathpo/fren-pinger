export function addTimestampToMessage(message) {
    return '[' + new Date().toISOString().slice(11, 24) + '] ' + message;
}
