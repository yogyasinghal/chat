// used for converting string to object
// for name and other strings
const moment = require('moment');
function formatMessage(username,text) {
    return {
        username,
        text,
        time :moment().format('h:m a')
    }
}
module.exports = formatMessage;